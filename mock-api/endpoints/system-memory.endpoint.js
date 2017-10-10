function systemMemory (server) {
  let _ = require('lodash');
  server.init('systemMemory');
  server.app.get('/system-memory/0.0.1/systems/:systemId', function (req, res) {
    server.logRequest('system-info', req);

    let query = req.query;
    query = _.split(query, '&');
    let systemId = 'foo-systemId';
    for (let i = 0; i < query.length; i++) {
      let str = query[i];
      if (_.startsWith(str, 'systemId')) {
        systemId = _.split(str, '==')[1];
      }
    }
    let limit = req.query.l || 1;

    let gib = 1024 * 1024 * 1024;
    let response = [];
    for (let i = 0; i < limit; i++) {
      var data = {
        systemId: systemId,
        agentId: 'foo-agentId',
        timeStamp: { $numberLong: Date.now().toString() },
        total: { $numberLong: (16 * gib).toString() },
        free: { $numberLong: (_.round(Math.random() * (16 * gib / 4))).toString() },
        buffers: { $numberLong: (16 * gib / 32).toString() },
        cached: { $numberLong: '0' },
        swapTotal: { $numberLong: (16 * gib / 2).toString() },
        swapFree: { $numberLong: (16 * gib / 2).toString() },
        commitLimit: { $numberLong: '0' }
      };
      response.push(data);
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: response
      }
    ));
  });
}

module.exports = systemMemory;
