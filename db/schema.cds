namespace dbadmin;

@cds.persistence.exists
@cds.persistence.name: 'VBAK'
entity VBAK {
  key VBELN : String(10);
  AUART : String(4);
  KUNNR : String(10);
  BP_CUST_NAME : String(100);
  BSTNK : String(35);
  WORK_ORDER : String(35);
  QUOTE_NUMBER : String(35);
  VKORG : String(4);
  VTWEG : String(2);
  SPART : String(2);
  VDATU : Date;
  AUDAT : Date;
  SHIP_VIA : String(50);
  SHIPPING_INSTR : String(500);
  ZTERM : String(20);
  PYMNT_GROUP : String(50);
  GROUP_CODE : String(20);
  VENDOR_INFO : String(500);
  NETWR : Decimal(15, 2);
  WAERK : String(5);
  GBSTK : String(1);
  WARNINGS : String(2000);
  TICKET_NOTES : String(1000);
  ERDAT : Date;
  ERNAM : String(50);
  CREATED_AT : Timestamp;
  UPDATED_AT : Timestamp;
}

@cds.persistence.exists
@cds.persistence.name: 'VBAP'
entity VBAP {
  key VBELN : String(10);
  key POSNR : String(6);
  MATNR : String(18);
  SUB_CAT_NUM : String(18);
  ARKTX : String(100);
  TAX_CODE : String(10);
  KWMENG : Decimal(15, 3);
  MEINS : String(3);
  NETPR : Decimal(15, 5);
  NETWR : Decimal(34, 2);
  EDATU : Date;
  CREATED_AT : Timestamp;
}

@cds.persistence.exists
@cds.persistence.name: 'VBKD'
entity VBKD {
  key VBELN : String(10);
  key POSNR : String(6);
  ZTERM : String(20);
  PYMNT_GROUP : String(50);
  BSARK : String(35);
  IHREZ : String(12);
  BNAME : String(35);
  TELF1 : String(16);
  CREATED_AT : Timestamp;
}

@cds.persistence.exists
@cds.persistence.name: 'VBPA'
entity VBPA {
  key VBELN : String(10);
  key POSNR : String(6);
  key PARVW : String(2);
  KUNNR : String(10);
  CONTACT_CODE : String(20);
  CONTACT_NAME : String(100);
  CONTACT_EMAIL : String(241);
  CONTACT_PHONE : String(30);
  ATTN_NAME : String(100);
  GOODS_RECIPIENT : String(100);
  UNLOADING_POINT : String(100);
  SHIPTO_FULL : String(250);
  SHIPTO_STREET : String(100);
  SHIPTO_CITY : String(50);
  SHIPTO_STATE : String(50);
  SHIPTO_ZIP : String(10);
  SHIPTO_CODE : String(20);
  BILLTO_FULL : String(250);
  BILLTO_STREET : String(100);
  BILLTO_CITY : String(50);
  BILLTO_STATE : String(50);
  BILLTO_ZIP : String(10);
  PAYTO_CODE : String(20);
  SITE_ADDRESS : String(250);
  SITE_STREET : String(100);
  SITE_CITY : String(50);
  SITE_STATE : String(50);
  SITE_ZIP : String(10);
  CREATED_AT : Timestamp;
}

@cds.persistence.exists
@cds.persistence.name: 'VBUK'
entity VBUK {
  key VBELN : String(10);
  GBSTK : String(1);
  ABSTK : String(1);
  LIFSK : String(2);
  FAKSK : String(2);
  CMGST : String(1);
  WARNINGS : String(2000);
  HAS_BLOCKING_WARN : String(1);
  CREATED_AT : Timestamp;
  UPDATED_AT : Timestamp;
}

