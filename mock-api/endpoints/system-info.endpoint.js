function systemInfo (server) {
  server.init('systemInfo');
  server.app.get('/system-info/:systemId', function (req, res, next) {
    server.logRequest('system-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: {
          systemId: req.params.systemId,
          hostName: req.params.systemId + '-host',
          osName: 'Linux',
          osKernel: '4.10.11-200.fc25.x86_64',
          cpuCount: 4,
          cpuModel: 'GenuineIntel',
          totalMemory: 16384
        }
      }
    ));
    next();
  });
}

module.exports = systemInfo;
