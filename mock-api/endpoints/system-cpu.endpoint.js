function systemCpu (server) {
  var _ = require('lodash');
  server.init('systemCpu');
  server.app.get('/system-cpu/0.0.1/systems/:systemId', function (req, res) {
    server.logRequest('system-info', req);
    res.setHeader('Content-Type', 'application/json');
    var randomUsage = function () {
      return _.round(Math.random() * 100);
    };
    res.send(JSON.stringify(
      {
        response: [{
          perProcessorUsage: [randomUsage(), randomUsage(), randomUsage(), randomUsage()]
        }]
      }
    ));
  });
}

module.exports = systemCpu;
