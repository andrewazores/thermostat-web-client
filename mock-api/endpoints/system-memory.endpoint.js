function systemMemory (server) {
  let _ = require('lodash');
  server.init('systemMemory');
  server.app.get('/system-memory/0.0.1/systems/:systemId', function (req, res, next) {
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

    let response = [];
    for (let i = 0; i < limit; i++) {
      var data = {
        systemId: systemId,
        agentId: 'mock-agentId',
        timestamp: new Date().getTime(),
        total: 16384,
        free: _.round(Math.random() * (16384 / 4)),
        buffers: 16384 / 32,
        cached: 0,
        swapTotal: 16384 / 2,
        swapFree: 16384 / 2,
        commitLimit: 0
      };
      response.push(data);
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: response
      }
    ));
    next();
  });
}

module.exports = systemMemory;
