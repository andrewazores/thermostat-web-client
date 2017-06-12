function jvmList (server) {
  var _ = require('lodash');
  server.init('jvms');
  server.app.get('/jvms/0.0.1/tree', function (req, res, next) {
    server.logRequest('jvm-list', req);
    res.setHeader('Content-Type', 'application/json');

    var limit = 4;
    var resp = [];
    if (req.query.limit) {
      limit = parseInt(req.query.limit);
      // 0 means no limit, so we'll default to 4
      if (limit === 0) {
        limit = 4;
      }
    }
    for (var i = 0; i < limit; i++) {
      var system = {
        'systemId': 'system-' + i,
        'jvms': [
          {
            'mainClass': 'c.r.t.A',
            'startTime': 45000,
            'jvmId': 'vm-0'
          },
          {
            'mainClass': 'c.r.t.B',
            'startTime': 45000,
            'jvmId': 'vm-1'
          },
          {
            'mainClass': 'c.r.t.C',
            'startTime': 45000,
            'jvmId': 'vm-2'
          },
          {
            'mainClass': 'c.r.t.D',
            'startTime': 45000,
            'jvmId': 'vm-3'
          }
        ]
      };
      resp.push(system);
    }
    res.send(JSON.stringify({ response: resp }));
    next();
  });

  server.app.get('/jvms/0.0.1/systems/:systemId/jvms/:jvmId', function (req, res, next) {
    server.logRequest('jvm-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [{
          systemId: req.params.systemId,
          jvmId: req.params.jvmId,
          mainClass: 'c.r.t.A',
          startTime: { $numberLong: (Date.now() - 5000000 + _.round(Math.random() * 1000000)).toString() },
          stopTime: { $numberLong: '-1' },
          isAlive: true,
          jvmPid: _.round(Math.random() * 2048) + 512,
          javaVersion: '1.9',
          javaHome: '/usr/lib/foo/java',
          javaCommandLine: 'java -XXsomeopt foo.jar',
          jvmArguments: 'foo=bar',
          jvmName: 'HotSpot',
          jvmInfo: 'some information',
          jvmVersion: '1.9',
          classpath: 'class:path',
          environment: [
            {
              key: 'FOO',
              value: 'BAR'
            },
            {
              key: 'baz',
              value: 'bam'
            }
          ],
          uid: { $numberLong: _.round(Math.random() * 800) },
          username: 'thermostat-user',
          lastUpdated: { $numberLong: Date.now().toString() }
        }]
      }
    ));
    next();
  });
}

module.exports = jvmList;
