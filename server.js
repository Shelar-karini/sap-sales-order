const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {

  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SAP Sales Order App</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
          h1 { color: #0070f2; }
          table { border-collapse: collapse; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          th { background: #0070f2; color: white; padding: 12px 16px; text-align: left; }
          td { padding: 12px 16px; border-bottom: 1px solid #eee; }
          a { color: #0070f2; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
          .badge { background: #e8f4e8; color: #2d7d2d; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>SAP Sales Order OData API</h1>
        <p>Status: <span class="badge">🟢 Running</span></p>
        <br/>
        <table>
          <tr>
            <th>Entity</th>
            <th>OData URL</th>
            <th>Fiori Preview</th>
          </tr>
          <tr>
            <td><strong>VBAK</strong> - Sales Order Header</td>
            <td><a href="/odata/v4/VBAK">/odata/v4/VBAK</a></td>
            <td><a href="/$fiori-preview/DynamicService/VBAK#preview-app" target="_blank">Fiori Preview ↗</a></td>
          </tr>
          <tr>
            <td><strong>VBAP</strong> - Sales Order Items</td>
            <td><a href="/odata/v4/VBAP">/odata/v4/VBAP</a></td>
            <td><a href="/$fiori-preview/DynamicService/VBAP#preview-app" target="_blank">Fiori Preview ↗</a></td>
          </tr>
          <tr>
            <td><strong>VBKD</strong> - Sales Document Business</td>
            <td><a href="/odata/v4/VBKD">/odata/v4/VBKD</a></td>
            <td><a href="/$fiori-preview/DynamicService/VBKD#preview-app" target="_blank">Fiori Preview ↗</a></td>
          </tr>
          <tr>
            <td><strong>VBPA</strong> - Sales Document Partner</td>
            <td><a href="/odata/v4/VBPA">/odata/v4/VBPA</a></td>
            <td><a href="/$fiori-preview/DynamicService/VBPA#preview-app" target="_blank">Fiori Preview ↗</a></td>
          </tr>
          <tr>
            <td><strong>VBUK</strong> - Sales Document Status</td>
            <td><a href="/odata/v4/VBUK">/odata/v4/VBUK</a></td>
            <td><a href="/$fiori-preview/DynamicService/VBUK#preview-app" target="_blank">Fiori Preview ↗</a></td>
          </tr>
          <tr>
            <td><strong>$metadata</strong></td>
            <td><a href="/odata/v4/$metadata">/odata/v4/$metadata</a></td>
            <td>-</td>
          </tr>
        </table>
      </body>
      </html>
    `);
  });
});

module.exports = cds.server;