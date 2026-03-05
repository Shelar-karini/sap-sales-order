const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  app.get('/', (req, res) => {
    res.json({
      status: '🟢 Running',
      service: 'SAP Sales Order OData API',
      version: '1.0.0',
      endpoints: {
        metadata          : '/odata/v4/$metadata',
        VBAK              : '/odata/v4/VBAK',
        VBAP              : '/odata/v4/VBAP',
        VBKD              : '/odata/v4/VBKD',
        VBPA              : '/odata/v4/VBPA',
        VBUK              : '/odata/v4/VBUK'
      }
    });
  });
});

module.exports = cds.server;