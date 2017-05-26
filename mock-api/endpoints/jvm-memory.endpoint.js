function jvmMemory (server) {
  var _ = require('lodash');
  server.init('jvmMemory');
  server.app.get('/jvm-memory/0.0.2', function (req, res, next) {
    server.logRequest('jvm-memory', req);

    var query = req.query.q;
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
            timeStamp: Date.now(),
            metaspaceMaxCapacity: 0,
            metaspaceMinCapacity: 0,
            metaspaceCapacity: 4096,
            metaspaceUsed: _.round(4096 * Math.random()),
            generations: [
              {
                capacity: 100,
                collector: 'Shenandoah',
                maxCapacity: 200,
                name: 'Generation 0',
                spaces: [
                  {
                    capacity: 50,
                    index: 0,
                    maxCapacity: 100,
                    name: 'Gen 0 Space 0',
                    used: _.round(50 * Math.random())
                  },
                  {
                    capacity: 50,
                    index: 1,
                    maxCapacity: 100,
                    name: 'Gen 0 Space 1',
                    used: _.round(50 * Math.random())
                  }
                ]
              },
              {
                capacity: 200,
                collector: 'Shenandoah',
                maxCapacity: 400,
                name: 'Generation 1',
                spaces: [
                  {
                    capacity: 200,
                    index: 0,
                    maxCapacity: 400,
                    name: 'Gen 1 Space 0',
                    used: _.round(200 * Math.random())
                  }
                ]
              },
              {
                capacity: 400,
                collector: 'G1',
                maxCapacity: 1600,
                name: 'Generation 2',
                spaces: [
                  {
                    capacity: 50,
                    index: 0,
                    maxCapacity: 400,
                    name: 'Gen 2 Space 0',
                    used: _.round(50 * Math.random())
                  },
                  {
                    capacity: 100,
                    index: 1,
                    maxCapacity: 200,
                    name: 'Gen 2 Space 1',
                    used: _.round(100 * Math.random())
                  },
                  {
                    capacity: 250,
                    index: 2,
                    maxCapacity: 1000,
                    name: 'Gen 2 Space 2',
                    used: _.round(250 * Math.random())
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
