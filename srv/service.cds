using { dbadmin } from '../db/schema';

service DynamicService @(path: '/odata/v4') {
  entity VBAK as projection on dbadmin.VBAK;
  entity VBAP as projection on dbadmin.VBAP;
  entity VBKD as projection on dbadmin.VBKD;
  entity VBPA as projection on dbadmin.VBPA;
  entity VBUK as projection on dbadmin.VBUK;
}