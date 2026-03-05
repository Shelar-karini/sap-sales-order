const cds = require('@sap/cds');
const hana = require('@sap/hana-client');
require('dotenv').config();

// ─── PERSISTENT HANA CONNECTION ─────────────────────────────
let conn = null;
const SCHEMA = process.env.HANA_SCHEMA || 'DBADMIN';

const getConnection = () => {
  if (conn) {
    try {
      // Test if connection is still alive
      conn.exec('SELECT 1 FROM DUMMY');
      return conn;
    } catch (e) {
      console.warn('⚠️  Connection lost, reconnecting...');
      conn = null;
    }
  }

  conn = hana.createConnection();
  conn.connect({
    serverNode: `${process.env.HANA_HOST}:${process.env.HANA_PORT || 443}`,
    uid: process.env.HANA_USER,
    pwd: process.env.HANA_PASSWORD,
    encrypt: 'true',
    sslValidateCertificate: 'false',
    connectTimeout: 30000,
    communicationTimeout: 30000
  });

  console.log('✅ HANA connection established');
  return conn;
};

// ─── LOAD SCHEMA FROM HANA ───────────────────────────────────
const loadSchemaFromHana = () => {
  const c = getConnection();

  const tables = c.exec(`
    SELECT TABLE_NAME 
    FROM SYS.TABLES 
    WHERE SCHEMA_NAME = '${SCHEMA}'
    AND TABLE_NAME NOT LIKE '#%'
    ORDER BY TABLE_NAME
  `);

  console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.TABLE_NAME).join(', '));

  const tableSchemas = {};

  for (const { TABLE_NAME } of tables) {
    const columns = c.exec(`
      SELECT COLUMN_NAME, DATA_TYPE_NAME
      FROM SYS.TABLE_COLUMNS
      WHERE SCHEMA_NAME = '${SCHEMA}'
      AND TABLE_NAME = '${TABLE_NAME}'
      ORDER BY POSITION
    `);

    let pkColumn = columns[0]?.COLUMN_NAME;
    try {
      const pkeys = c.exec(`
        SELECT TC.COLUMN_NAME
        FROM SYS.TABLE_COLUMNS TC
        INNER JOIN SYS.INDEX_COLUMNS IC
          ON TC.SCHEMA_NAME = IC.SCHEMA_NAME
          AND TC.TABLE_NAME = IC.TABLE_NAME
          AND TC.COLUMN_NAME = IC.COLUMN_NAME
        INNER JOIN SYS.INDEXES I
          ON IC.SCHEMA_NAME = I.SCHEMA_NAME
          AND IC.TABLE_NAME = I.TABLE_NAME
          AND IC.INDEX_NAME = I.INDEX_NAME
        WHERE TC.SCHEMA_NAME = '${SCHEMA}'
        AND TC.TABLE_NAME = '${TABLE_NAME}'
        AND I.CONSTRAINT = 'PRIMARY KEY'
      `);
      if (pkeys.length > 0) pkColumn = pkeys[0].COLUMN_NAME;
    } catch (e) {
      console.warn(`⚠️  No PK for ${TABLE_NAME}, using first column: ${pkColumn}`);
    }

    const columnMap = {};
    for (const col of columns) {
      columnMap[col.COLUMN_NAME.toLowerCase()] = col.COLUMN_NAME;
    }

    tableSchemas[TABLE_NAME] = { columnMap, pkColumn };
  }

  return tableSchemas;
};

// ─── HELPERS ─────────────────────────────────────────────────
const extractWhereClause = (req, columnMap) => {
  let whereClause = '';
  const params = [];

  if (req.query?.SELECT?.where) {
    const where = req.query.SELECT.where;
    for (let i = 0; i < where.length; i++) {
      const clause = where[i];
      if (clause.ref && clause.ref[0]) {
        const dbColumn = columnMap[clause.ref[0].toLowerCase()] || clause.ref[0];
        const operator = where[i + 1];
        const value = where[i + 2];
        if (operator === '=' && value?.val !== undefined) {
          whereClause = ` WHERE "${dbColumn}" = ?`;
          params.push(value.val);
          break;
        }
      }
    }
  }

  return { whereClause, params };
};

const buildSetClause = (data, columnMap) => {
  const setClauses = [];
  const params = [];
  for (const [field, value] of Object.entries(data)) {
    const dbColumn = columnMap[field.toLowerCase()] || field;
    setClauses.push(`"${dbColumn}" = ?`);
    params.push(value);
  }
  return { setClause: setClauses.join(', '), params };
};

const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      const c = getConnection();
      c.exec(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    } catch (e) {
      reject(e);
    }
  });
};

// ─── MAIN SERVICE ────────────────────────────────────────────
module.exports = cds.service.impl(async function () {

  // Load all table schemas from HANA at startup
  const tableSchemas = loadSchemaFromHana();

  for (const [TABLE_NAME, { columnMap, pkColumn }] of Object.entries(tableSchemas)) {
    console.log(`🔧 Registering handlers for: ${TABLE_NAME} (PK: ${pkColumn})`);

    // ─── READ ──────────────────────────────────────────────
    this.on('READ', TABLE_NAME, async (req) => {
      const { whereClause, params } = extractWhereClause(req, columnMap);

      let keyFilter = '';
      const keyParams = [];
      if (req.params?.[0] && !whereClause) {
        const keyVal = typeof req.params[0] === 'object'
          ? Object.values(req.params[0])[0]
          : req.params[0];
        keyFilter = ` WHERE "${pkColumn}" = ?`;
        keyParams.push(keyVal);
      }

      const finalWhere = whereClause || keyFilter;
      const finalParams = params.length ? params : keyParams;
      const sql = `SELECT * FROM "${SCHEMA}"."${TABLE_NAME}"${finalWhere}`;

      console.log(`READ ${TABLE_NAME}:`, sql, finalParams);
      return runSQL(sql, finalParams);
    });

    // ─── CREATE ────────────────────────────────────────────
    this.on('CREATE', TABLE_NAME, async (req) => {
      const data = req.data;
      const columns = Object.keys(data).map(k => `"${columnMap[k.toLowerCase()] || k}"`).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      const sql = `INSERT INTO "${SCHEMA}"."${TABLE_NAME}" (${columns}) VALUES (${placeholders})`;

      console.log(`CREATE ${TABLE_NAME}:`, sql, values);
      await runSQL(sql, values);
      return data;
    });

    // ─── UPDATE ────────────────────────────────────────────
    this.on('UPDATE', TABLE_NAME, async (req) => {
      const data = { ...req.data };
      const id = data[pkColumn] || req.params?.[0]?.[pkColumn] || Object.values(req.params?.[0] || {})[0];
      delete data[pkColumn];

      const { setClause, params } = buildSetClause(data, columnMap);
      const sql = `UPDATE "${SCHEMA}"."${TABLE_NAME}" SET ${setClause} WHERE "${pkColumn}" = ?`;

      console.log(`UPDATE ${TABLE_NAME}:`, sql, [...params, id]);
      await runSQL(sql, [...params, id]);
      return req.data;
    });

    // ─── DELETE ────────────────────────────────────────────
    this.on('DELETE', TABLE_NAME, async (req) => {
      const id = req.data?.[pkColumn] || req.params?.[0]?.[pkColumn] || Object.values(req.params?.[0] || {})[0];
      const sql = `DELETE FROM "${SCHEMA}"."${TABLE_NAME}" WHERE "${pkColumn}" = ?`;

      console.log(`DELETE ${TABLE_NAME}:`, sql, [id]);
      await runSQL(sql, [id]);
    });
  }
});