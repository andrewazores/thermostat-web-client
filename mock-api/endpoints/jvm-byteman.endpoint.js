function jvmByteman (server) {
  // web-gateway
  var _ = require('lodash');
  server.init('jvmByteman');
  server.app.get('/jvm-byteman/0.0.1/status/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-byteman', req);

    var jvmId = req.params.jvmId;

    var response = [];
    var data = {
      agentId: 'foo-agentId',
      jvmId: jvmId,
      timeStamp: { $numberLong: Date.now().toString() },
      rule: '',
      listenPort: 9999
    };
    response.push(data);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: response
      }
    ));
  });

  // command channel
  server.init('byteman-command');
  server.app.ws('/commands/v1/actions/byteman/systems/:systemId/agents/:agentId/jvms/:jvmId/sequence/:seqId', function (ws, req) {
    server.logRequest('byteman-command', req);
    ws.on('message', function (msg) {
      ws.send(JSON.stringify(
        {
          payload: {
            respType: 'OK'
          }
        }
      ));
    });
  });
}

module.exports = jvmByteman;
