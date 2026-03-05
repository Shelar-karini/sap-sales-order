const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  app.use((req, res, next) => {
    if (req.url && req.url.includes('+')) {
      console.log('Original URL:', req.url);
      req.url = req.url.replace(/\+/g, '%20');
      console.log('Fixed URL:', req.url);
    }
    next();
  });
});
