function killVm (server) {
  server.init('kill-vm-command');
  server.app.ws('/commands/v1/actions/kill_vm/systems/:systemId/agents/:agentId/jvms/:jvmId/sequence/:seqId', function (ws, req) {
    server.logRequest('kill-vm-command', req);
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

module.exports = killVm;
