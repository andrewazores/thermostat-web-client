function jvmMemory (server) {
  var _ = require('lodash');
  server.init('jvmMemory');
  server.app.get('/jvm-memory/0.0.3', function (req, res, next) {
    server.logRequest('jvm-memory', req);

    var query = req.query.query;
    query = _.split(query, '&');
    var jvmId = undefined;
    for (var i = 0; i < query.length; i++) {
      var str = query[i];
      if (_.startsWith(str, 'jvmId')) {
        jvmId = _.split(str, '==')[1];
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [
          {
            agentId: 'foo-agentId',
            jvmId: jvmId,
            timeStamp: { $numberLong: Date.now().toString() },
            metaspaceMaxCapacity: { $numberLong: '0' },
            metaspaceMinCapacity: { $numberLong: '0' },
            metaspaceCapacity: { $numberLong: (4096 * 1024 * 1024).toString() },
            metaspaceUsed: { $numberLong: _.round(4096 * 1024 * 1024 * Math.random()).toString() },
            generations: [
              {
                capacity: { $numberLong: (100 * 1024 * 1024).toString() },
                collector: 'Shenandoah',
                maxCapacity: { $numberLong: (200 * 1024 * 1024).toString() },
                name: 'Generation 0',
                spaces: [
                  {
                    capacity: { $numberLong: (50 * 1024 * 1024).toString() },
                    index: 0,
                    maxCapacity: { $numberLong: (100 * 1024 * 1024).toString() },
                    name: 'Gen 0 Space 0',
                    used: { $numberLong: _.round(50 * 1024 * 1024 * Math.random()).toString() }
                  },
                  {
                    capacity: { $numberLong: (50 * 1024 * 1024).toString() },
                    index: 1,
                    maxCapacity: { $numberLong: (100 * 1024 * 1024).toString() },
                    name: 'Gen 0 Space 1',
                    used: { $numberLong: _.round(50 * 1024 * 1024 * Math.random()).toString() }
                  }
                ]
              },
              {
                capacity: { $numberLong: (200 * 1024 * 1024).toString() },
                collector: 'Shenandoah',
                maxCapacity: { $numberLong: (400 * 1024 * 1024).toString() },
                name: 'Generation 1',
                spaces: [
                  {
                    capacity: { $numberLong: (200 * 1024 * 1024).toString() },
                    index: 0,
                    maxCapacity: { $numberLong: (400 * 1024 * 1024).toString() },
                    name: 'Gen 1 Space 0',
                    used: { $numberLong: _.round(200 * 1024 * 1024 * Math.random()).toString() }
                  }
                ]
              },
              {
                capacity: { $numberLong: (400 * 1024 * 1024).toString() },
                collector: 'G1',
                maxCapacity: { $numberLong: (1600 * 1024 * 1024).toString() },
                name: 'Generation 2',
                spaces: [
                  {
                    capacity: { $numberLong: (50 * 1024 * 1024).toString() },
                    index: 0,
                    maxCapacity: { $numberLong: (400 * 1024 * 1024).toString() },
                    name: 'Gen 2 Space 0',
                    used: { $numberLong: _.round(50 * 1024 * 1024 * Math.random()).toString() }
                  },
                  {
                    capacity: { $numberLong: (100 * 1024 * 1024).toString() },
                    index: 1,
                    maxCapacity: { $numberLong: (200 * 1024 * 1024).toString() },
                    name: 'Gen 2 Space 1',
                    used: { $numberLong: _.round(100 * 1024 * 1024 * Math.random()).toString() }
                  },
                  {
                    capacity: { $numberLong: (250 * 1024 * 1024).toString() },
                    index: 2,
                    maxCapacity: { $numberLong: (1000 * 1024 * 1024).toString() },
                    name: 'Gen 2 Space 2',
                    used: { $numberLong: _.round(250 * 1024 * 1024 * Math.random()).toString() }
                  }
                ]
              }
            ]
          }
        ]
      }
    ));
    next();
  });
}

module.exports = jvmMemory;
