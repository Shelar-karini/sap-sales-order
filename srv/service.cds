using { dbadmin } from '../db/schema';

service DynamicService @(path: '/odata/v4') {

  entity PURCHASEORDERDETAILS as projection on dbadmin.PURCHASEORDERDETAILS;

  entity PURCHASEORDERHEADER as projection on dbadmin.PURCHASEORDERHEADER;

}