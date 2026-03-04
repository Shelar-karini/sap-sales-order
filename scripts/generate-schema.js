const hana = require('@sap/hana-client');
const fs = require('fs');
const path = require('path');

// ─── HANA CONNECTION CONFIG ──────────────────────────────────
const conn = hana.createConnection();
conn.connect({
  serverNode: '2a6c5de0-3b95-4111-8546-f97b6bed906e.hna1.prod-us10.hanacloud.ondemand.com:443',
  uid: 'DBADMIN',
  pwd: 'Aditya@285',
  encrypt: 'true',
  sslValidateCertificate: 'false'
});

console.log('✅ Connected to SAP HANA');

// ─── HANA → CDS TYPE MAPPING ────────────────────────────────
const typeMap = {
  'NVARCHAR'  : 'String',
  'VARCHAR'   : 'String',
  'CHAR'      : 'String',
  'NCHAR'     : 'String',
  'INTEGER'   : 'Integer',
  'INT'       : 'Integer',
  'BIGINT'    : 'Integer64',
  'SMALLINT'  : 'Integer',
  'TINYINT'   : 'Integer',
  'DECIMAL'   : 'Decimal',
  'NUMERIC'   : 'Decimal',
  'DOUBLE'    : 'Double',
  'REAL'      : 'Double',
  'FLOAT'     : 'Double',
  'DATE'      : 'Date',
  'TIME'      : 'Time',
  'TIMESTAMP' : 'Timestamp',
  'BOOLEAN'   : 'Boolean',
  'CLOB'      : 'LargeString',
  'NCLOB'     : 'LargeString',
  'BLOB'      : 'LargeBinary',
  'TEXT'      : 'LargeString'
};

// ─── FETCH ALL TABLES ────────────────────────────────────────
const tables = conn.exec(`
  SELECT TABLE_NAME 
  FROM SYS.TABLES 
  WHERE SCHEMA_NAME = 'DBADMIN'
  AND TABLE_NAME NOT LIKE '#%'
  ORDER BY TABLE_NAME
`);

console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.TABLE_NAME).join(', '));

// ─── GENERATE SCHEMA.CDS ─────────────────────────────────────
let schema = `namespace dbadmin;\n\n`;
let service = `using { dbadmin } from '../db/schema';\n\nservice DynamicService @(path: '/odata/v4') {\n\n`;

for (const { TABLE_NAME } of tables) {

  // Get columns for this table
  const columns = conn.exec(`
    SELECT 
      COLUMN_NAME, 
      DATA_TYPE_NAME, 
      IS_NULLABLE, 
      LENGTH,
      SCALE,
      POSITION
    FROM SYS.TABLE_COLUMNS
    WHERE SCHEMA_NAME = 'DBADMIN' 
    AND TABLE_NAME = '${TABLE_NAME}'
    ORDER BY POSITION
  `);

  // Get primary key columns - FIXED (no ambiguous columns)
  let pkColumns = [];
  try {
    const pkeys = conn.exec(`
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
      WHERE TC.SCHEMA_NAME = 'DBADMIN'
      AND TC.TABLE_NAME = '${TABLE_NAME}'
      AND I.CONSTRAINT = 'PRIMARY KEY'
    `);
    pkColumns = pkeys.map(p => p.COLUMN_NAME);
  } catch(e) {
    console.warn(`⚠️  Could not get PK for ${TABLE_NAME}, defaulting to first column`);
    pkColumns = [columns[0]?.COLUMN_NAME];
  }

  // If no PK found, default to first column
  if (pkColumns.length === 0 && columns.length > 0) {
    pkColumns = [columns[0].COLUMN_NAME];
    console.warn(`⚠️  No PK found for ${TABLE_NAME}, using ${pkColumns[0]} as key`);
  }

  // Build entity in schema.cds
  schema += `@cds.persistence.exists\n`;
  schema += `@cds.persistence.name: '${TABLE_NAME}'\n`;
  schema += `entity ${TABLE_NAME} {\n`;

  for (const col of columns) {
    const cdsType = typeMap[col.DATA_TYPE_NAME] || 'String';
    const isKey = pkColumns.includes(col.COLUMN_NAME);
    const length = (cdsType === 'String' && col.LENGTH) ? `(${col.LENGTH})` : '';
    const scale = (cdsType === 'Decimal' && col.LENGTH) ? `(${col.LENGTH}, ${col.SCALE || 2})` : '';
    const keyPrefix = isKey ? 'key ' : '';

    schema += `  ${keyPrefix}${col.COLUMN_NAME} : ${cdsType}${length}${scale};\n`;
  }

  schema += `}\n\n`;

  // Add entity to service.cds with draft + exact table name mapping
  service += `  @odata.draft.enabled\n`;
  service += `  @cds.persistence.name: '${TABLE_NAME}'\n`;
  service += `  entity ${TABLE_NAME} as projection on dbadmin.${TABLE_NAME};\n\n`;
}

service += `}\n`;

// ─── WRITE FILES ─────────────────────────────────────────────
const dbDir = path.join(__dirname, '..', 'db');
const srvDir = path.join(__dirname, '..', 'srv');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(srvDir)) fs.mkdirSync(srvDir, { recursive: true });

fs.writeFileSync(path.join(dbDir, 'schema.cds'), schema);
fs.writeFileSync(path.join(srvDir, 'service.cds'), service);

console.log('\n✅ Generated files:');
console.log('   db/schema.cds');
console.log('   srv/service.cds');
console.log(`\n🚀 ${tables.length} tables exposed via OData with draft support!`);
console.log('\nNow run: cds watch');

conn.disconnect();
