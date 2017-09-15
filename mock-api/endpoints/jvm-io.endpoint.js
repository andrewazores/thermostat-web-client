function jvmIo (server) {
  var _ = require('lodash');
  server.init('jvmIo');

  server.app.get('/jvm-io/0.0.1/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-io', req);

    var jvmId = req.params.jvmId;

    var response = [
      {
        agentId: 'foo-agentId',
        jvmId: jvmId,
        timeStamp: { $numberLong: Date.now().toString() },
        charactersRead: { $numberLong: _.floor((Math.random() * 10000000)).toString() },
        charactersWritten: { $numberLong: _.floor((Math.random() * 10000000)).toString() },
        readSysCalls: { $numberLong: _.floor((Math.random() * 25000)).toString() },
        writeSysCalls: { $numberLong: _.floor((Math.random() * 120000)).toString() }
      }
    ];

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: response
      }
    ));
  });
}

module.exports = jvmIo;
