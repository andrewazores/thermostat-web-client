function jvmList (server) {
  var _ = require('lodash');
  server.init('jvms');
  server.app.get('/jvms/0.0.1/tree', function (req, res, next) {
    server.logRequest('jvm-list', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      [
        {
          "systemId": "system-0",
          "jvms": [
            {
              "mainClass": "c.r.t.A",
              "startTime": 45000,
              "jvmId": "vm-0"
            },
            {
              "mainClass": "c.r.t.B",
              "startTime": 45000,
              "jvmId": "vm-1"
            },
            {
              "mainClass": "c.r.t.C",
              "startTime": 45000,
              "jvmId": "vm-2"
            },
            {
              "mainClass": "c.r.t.D",
              "startTime": 45000,
              "jvmId": "vm-3"
            }
          ]
        },
        {
          "systemId": "system-1",
          "jvms": [
            {
              "mainClass": "c.r.t.A",
              "startTime": 45000,
              "jvmId": "vm-0"
            },
            {
              "mainClass": "c.r.t.B",
              "startTime": 45000,
              "jvmId": "vm-1"
            },
            {
              "mainClass": "c.r.t.C",
              "startTime": 45000,
              "jvmId": "vm-2"
            },
            {
              "mainClass": "c.r.t.D",
              "startTime": 45000,
              "jvmId": "vm-3"
            }
          ]
        },
        {
          "systemId": "system-2",
          "jvms": [
            {
              "mainClass": "c.r.t.A",
              "startTime": 45000,
              "jvmId": "vm-0"
            },
            {
              "mainClass": "c.r.t.B",
              "startTime": 45000,
              "jvmId": "vm-1"
            },
            {
              "mainClass": "c.r.t.C",
              "startTime": 45000,
              "jvmId": "vm-2"
            },
            {
              "mainClass": "c.r.t.D",
              "startTime": 45000,
              "jvmId": "vm-3"
            }
          ]
        },
        {
          "systemId": "system-3",
          "jvms": [
            {
              "mainClass": "c.r.t.A",
              "startTime": 45000,
              "jvmId": "vm-0"
            },
            {
              "mainClass": "c.r.t.B",
              "startTime": 45000,
              "jvmId": "vm-1"
            },
            {
              "mainClass": "c.r.t.C",
              "startTime": 45000,
              "jvmId": "vm-2"
            },
            {
              "mainClass": "c.r.t.D",
              "startTime": 45000,
              "jvmId": "vm-3"
            }
          ]
        }
      ]
    ));
    next();
  });

  server.app.get('/jvms/0.0.1/systems/:systemId/jvms/:jvmId', function (req, res, next) {
    server.logRequest('jvm-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: {
          systemId: req.params.systemId,
          jvmId: req.params.jvmId,
          mainClass: 'c.r.t.A',
          startTime: Date.now() - 5000000 + _.round(Math.random() * 1000000),
          endTime: -1,
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
              FOO: 'BAR'
            },
            {
              baz: 'bam'
            }
          ],
          uid: _.round(Math.random() * 800),
          username: 'thermostat-user',
          lastUpdated: Date.now()
        }
      }
    ));
    next();
  });
}

module.exports = jvmList;
