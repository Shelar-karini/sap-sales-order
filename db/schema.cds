namespace dbadmin;

@cds.persistence.exists
@cds.persistence.name: 'PURCHASEORDERDETAILS'
entity PURCHASEORDERDETAILS {
  key ID : Integer;
  HEADER_ID : Integer;
  SUBCATNUM : String(50);
  U_SWK_LINENUM : String(50);
  SWAGELOK_ITEMCODE : String(100);
  QUANTITY : String(50);
  U_SWK_NEEDSHIPDATE : String(50);
  TAXCODE : String(50);
  U_SWK_BTPRICE : String(50);
  U_ZEDS_COMMENTS : LargeString;
  UNITOFMEASURE : String(50);
}

@cds.persistence.exists
@cds.persistence.name: 'PURCHASEORDERHEADER'
entity PURCHASEORDERHEADER {
  key ID : Integer;
  BP_CUSTNUM_CARDCODE : String(50);
  BP_CUSTNAME_CARDNAME : String(255);
  PO_NUM_NUMATCARD : String(50);
  WORK_ORDER : String(50);
  ADDRESS2 : String(255);
  ADDRESS2_STREET : String(255);
  ADDRESS2_CITY : String(100);
  ADDRESS2_STATE : String(50);
  ADDRESS2_ZIPCODE : String(20);
  SHIPTOCODE : String(50);
  CNTCTCODE : String(50);
  CONTACTNAME : String(255);
  CONTACTEMAIL : String(255);
  CONTACTPHONENUMBER : String(50);
  ATTN_NAME : String(255);
  GOODS_RECIPIENT : String(255);
  UNLOADING_POINT : String(255);
  ADDRESS : String(255);
  ADDRESS_STREET : String(255);
  ADDRESS_CITY : String(100);
  ADDRESS_STATE : String(50);
  ADDRESS_ZIPCODE : String(20);
  PAYTOCODE : String(50);
  U_SWK_BPTARGETNEEDDATE : String(50);
  QUOTENUMBER : String(50);
  SHIPVIA : String(100);
  VENDORINFORMATION : String(500);
  SHIPPINGINSTRUCTIONS : String(500);
  SITE_ADDRESS : String(255);
  SITE_STREET : String(255);
  SITE_CITY : String(100);
  SITE_STATE : String(50);
  SITE_ZIPCODE : String(20);
  IDP_PAYMENTTERMS : String(100);
  PYMNTGROUP : String(50);
  GROUPCODE : String(50);
  WARNINGS : LargeString;
  TICKET_NOTES : LargeString;
  TOTAL_PRICE : String(50);
}