function jvmCpu (server) {
  var _ = require('lodash');
  server.init('jvmCpu');

  server.app.get('/jvm-cpu/0.0.1/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-cpu', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [
          {
            agentId: 'foo-agentId',
            jvmId: req.params.jvmId,
            timeStamp: { $numberLong: Date.now().toString() },
            programTicks: { $numberLong: _.floor(Math.random() * 1000000).toString() },
            cpuLoad: Math.random()
          }
        ]
      }
    ));
  });

  server.app.get('/jvm-cpu/0.0.1/systems/:systemId/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-cpu', req);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [
          {
            agentId: 'foo-agentId',
            systemId: req.params.systemId,
            jvmId: req.params.jvmId,
            timeStamp: { $numberLong: Date.now().toString() },
            programTicks: { $numberLong: _.floor((Math.random() * 10000000)).toString() },
            cpuLoad: Math.random()
          }
        ]
      }
    ));
  });
}

module.exports = jvmCpu;
