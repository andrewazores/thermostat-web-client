function systemCpu (server) {
  var _ = require('lodash');
  server.init('systemCpu');
  server.app.get('/system-info/cpu/:systemId', function (req, res, next) {
    server.logRequest('system-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: {
          percent: _.round(Math.random() * 100)
        }
      }
    ));
    next();
  });
}

module.exports = systemCpu;
