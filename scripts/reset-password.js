require('dotenv').config();
const hana = require('@sap/hana-client');

const NEW_PASSWORD = 'KariniSAP2026!';

const conn = hana.createConnection();
conn.connect({
  serverNode: process.env.HANA_HOST + ':443',
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: 'true',
  sslValidateCertificate: 'false'
});

console.log('✅ Connected!');

conn.exec(`ALTER USER DBADMIN PASSWORD "${NEW_PASSWORD}"`, (err) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ Password changed successfully!');
    console.log(`✅ Update your .env: HANA_PASSWORD=${NEW_PASSWORD}`);
  }
  conn.disconnect();
});