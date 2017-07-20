function pingCommand (server) {
  server.init('ping-command');
  server.app.ws('/commands/v1/actions/ping/systems/:systemId/agents/:agentId/jvms/:jvmId/sequence/:seqId', function (ws, req) {
    server.logRequest('ping-command', req);
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

module.exports = pingCommand;
