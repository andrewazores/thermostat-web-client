function systemInfo (server) {
  server.init('systemInfo');
  server.app.get('/systems/0.0.1/systems/:systemId', function (req, res, next) {
    server.logRequest('system-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [{
          systemId: req.params.systemId,
          hostname: req.params.systemId + '-host',
          osName: 'Linux',
          osKernel: '4.10.11-200.fc25.x86_64',
          cpuCount: 4,
          cpuModel: 'GenuineIntel',
          totalMemory: 16 * 1024 * 1024 * 1024,
          timeCreated: { $numberLong: (Date.now() - (Math.floor(Math.random() * 100000000))).toString() }
        }]
      }
    ));
    next();
  });
}

module.exports = systemInfo;
