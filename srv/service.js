const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const db = await cds.connect.to('db');

  // ─── HELPER: Extract WHERE clause from CDS query ────────────
  const extractWhereClause = (req, columnMap) => {
    let whereClause = '';
    const params = [];

    if (req.query.SELECT && req.query.SELECT.where) {
      const where = req.query.SELECT.where;

      for (let i = 0; i < where.length; i++) {
        const clause = where[i];

        if (clause.ref && clause.ref[0]) {
          const odataColumn = clause.ref[0].toLowerCase();
          const dbColumn = columnMap[odataColumn] || clause.ref[0];

          const operator = where[i + 1];
          const value = where[i + 2];

          if (operator === '=' && value && value.val !== undefined) {
            whereClause = ` WHERE "${dbColumn}" = ?`;
            params.push(value.val);
            break;
          }
        }
      }
    }

    return { whereClause, params };
  };

  // ─── HELPER: Build SET clause for UPDATE ────────────────────
  const buildSetClause = (data, columnMap) => {
    const setClauses = [];
    const params = [];

    for (const [odataField, value] of Object.entries(data)) {
      const dbColumn = columnMap[odataField.toLowerCase()] || odataField;
      setClauses.push(`"${dbColumn}" = ?`);
      params.push(value);
    }

    return { setClause: setClauses.join(', '), params };
  };

  // ============================================================
  // PURCHASEORDERHEADER
  // ============================================================
  const headerColumnMap = {
    'id'                     : 'ID',
    'bp_custnum_cardcode'    : 'BP_CUSTNUM_CARDCODE',
    'bp_custname_cardname'   : 'BP_CUSTNAME_CARDNAME',
    'po_num_numatcard'       : 'PO_NUM_NUMATCARD',
    'work_order'             : 'WORK_ORDER',
    'address2'               : 'ADDRESS2',
    'address2_street'        : 'ADDRESS2_STREET',
    'address2_city'          : 'ADDRESS2_CITY',
    'address2_state'         : 'ADDRESS2_STATE',
    'address2_zipcode'       : 'ADDRESS2_ZIPCODE',
    'shiptocode'             : 'SHIPTOCODE',
    'cntctcode'              : 'CNTCTCODE',
    'contactname'            : 'CONTACTNAME',
    'contactemail'           : 'CONTACTEMAIL',
    'contactphonenumber'     : 'CONTACTPHONENUMBER',
    'attn_name'              : 'ATTN_NAME',
    'goods_recipient'        : 'GOODS_RECIPIENT',
    'unloading_point'        : 'UNLOADING_POINT',
    'address'                : 'ADDRESS',
    'address_street'         : 'ADDRESS_STREET',
    'address_city'           : 'ADDRESS_CITY',
    'address_state'          : 'ADDRESS_STATE',
    'address_zipcode'        : 'ADDRESS_ZIPCODE',
    'paytocode'              : 'PAYTOCODE',
    'u_swk_bptargetneeddate' : 'U_SWK_BPTARGETNEEDDATE',
    'quotenumber'            : 'QUOTENUMBER',
    'shipvia'                : 'SHIPVIA',
    'vendorinformation'      : 'VENDORINFORMATION',
    'shippinginstructions'   : 'SHIPPINGINSTRUCTIONS',
    'site_address'           : 'SITE_ADDRESS',
    'site_street'            : 'SITE_STREET',
    'site_city'              : 'SITE_CITY',
    'site_state'             : 'SITE_STATE',
    'site_zipcode'           : 'SITE_ZIPCODE',
    'idp_paymentterms'       : 'IDP_PAYMENTTERMS',
    'pymntgroup'             : 'PYMNTGROUP',
    'groupcode'              : 'GROUPCODE',
    'warnings'               : 'WARNINGS',
    'ticket_notes'           : 'TICKET_NOTES',
    'total_price'            : 'TOTAL_PRICE'
  };

  // READ
  this.on('READ', 'PURCHASEORDERHEADER', async (req) => {
    const { whereClause, params } = extractWhereClause(req, headerColumnMap);
    const sql = `SELECT * FROM "DBADMIN"."PURCHASEORDERHEADER"${whereClause}`;
    console.log('PURCHASEORDERHEADER READ:', sql, params);
    return db.run(sql, params);
  });

  // CREATE
  this.on('CREATE', 'PURCHASEORDERHEADER', async (req) => {
    const data = req.data;
    const columns = Object.keys(data).map(k => `"${headerColumnMap[k.toLowerCase()] || k}"`).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO "DBADMIN"."PURCHASEORDERHEADER" (${columns}) VALUES (${placeholders})`;
    console.log('PURCHASEORDERHEADER CREATE:', sql, values);
    await db.run(sql, values);
    return data;
  });

  // UPDATE
  this.on('UPDATE', 'PURCHASEORDERHEADER', async (req) => {
    const data = { ...req.data };
    const id = data.ID || req.params?.[0]?.ID;
    delete data.ID;
    const { setClause, params } = buildSetClause(data, headerColumnMap);
    const sql = `UPDATE "DBADMIN"."PURCHASEORDERHEADER" SET ${setClause} WHERE "ID" = ?`;
    console.log('PURCHASEORDERHEADER UPDATE:', sql, [...params, id]);
    await db.run(sql, [...params, id]);
    return req.data;
  });

  // DELETE
  this.on('DELETE', 'PURCHASEORDERHEADER', async (req) => {
    const id = req.data?.ID || req.params?.[0]?.ID;
    const sql = `DELETE FROM "DBADMIN"."PURCHASEORDERHEADER" WHERE "ID" = ?`;
    console.log('PURCHASEORDERHEADER DELETE:', sql, [id]);
    await db.run(sql, [id]);
  });

  // ============================================================
  // PURCHASEORDERDETAILS
  // ============================================================
  const detailsColumnMap = {
    'id'                 : 'ID',
    'header_id'          : 'HEADER_ID',
    'subcatnum'          : 'SUBCATNUM',
    'u_swk_linenum'      : 'U_SWK_LINENUM',
    'swagelok_itemcode'  : 'SWAGELOK_ITEMCODE',
    'quantity'           : 'QUANTITY',
    'u_swk_needshipdate' : 'U_SWK_NEEDSHIPDATE',
    'taxcode'            : 'TAXCODE',
    'u_swk_btprice'      : 'U_SWK_BTPRICE',
    'u_zeds_comments'    : 'U_ZEDS_COMMENTS',
    'unitofmeasure'      : 'UNITOFMEASURE'
  };

  // READ
  this.on('READ', 'PURCHASEORDERDETAILS', async (req) => {
    const { whereClause, params } = extractWhereClause(req, detailsColumnMap);
    const sql = `SELECT * FROM "DBADMIN"."PURCHASEORDERDETAILS"${whereClause}`;
    console.log('PURCHASEORDERDETAILS READ:', sql, params);
    return db.run(sql, params);
  });

  // CREATE
  this.on('CREATE', 'PURCHASEORDERDETAILS', async (req) => {
    const data = req.data;
    const columns = Object.keys(data).map(k => `"${detailsColumnMap[k.toLowerCase()] || k}"`).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const sql = `INSERT INTO "DBADMIN"."PURCHASEORDERDETAILS" (${columns}) VALUES (${placeholders})`;
    console.log('PURCHASEORDERDETAILS CREATE:', sql, values);
    await db.run(sql, values);
    return data;
  });

  // UPDATE
  this.on('UPDATE', 'PURCHASEORDERDETAILS', async (req) => {
    const data = { ...req.data };
    const id = data.ID || req.params?.[0]?.ID;
    delete data.ID;
    const { setClause, params } = buildSetClause(data, detailsColumnMap);
    const sql = `UPDATE "DBADMIN"."PURCHASEORDERDETAILS" SET ${setClause} WHERE "ID" = ?`;
    console.log('PURCHASEORDERDETAILS UPDATE:', sql, [...params, id]);
    await db.run(sql, [...params, id]);
    return req.data;
  });

  // DELETE
  this.on('DELETE', 'PURCHASEORDERDETAILS', async (req) => {
    const id = req.data?.ID || req.params?.[0]?.ID;
    const sql = `DELETE FROM "DBADMIN"."PURCHASEORDERDETAILS" WHERE "ID" = ?`;
    console.log('PURCHASEORDERDETAILS DELETE:', sql, [id]);
    await db.run(sql, [id]);
  });

});