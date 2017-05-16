function systemMemory (server) {
  var _ = require('lodash');
  server.init('systemMemory');
  server.app.get('/system-info/memory/:systemId', function (req, res, next) {
    server.logRequest('system-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: {
          total: 16384,
          used: _.round(Math.random() * 16384)
        }
      }
    ));
    next();
  });
}

module.exports = systemMemory;
