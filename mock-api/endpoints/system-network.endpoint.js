function systemNetwork (server) {
  let _ = require('lodash');
  server.init('systemNetwork');
  server.app.get('/system-network/0.0.1/systems/:systemId', function (req, res) {
    server.logRequest('system-network', req);

    var data = {
      agentId: 'foo-agentId',
      timeStamp: new Date().getTime(),
      interfaces: [
        {
          'interfaceName': 'lo',
          'displayName': 'lo',
          'ip4Addr': '127.0.0.1',
          'ip6Addr': '0:0:0:0:0:0:0:1%lo'
        },
        {
          'interfaceName': 'docker0',
          'displayName': 'docker0',
          'ip4Addr': '172.17.0.1',
          'ip6Addr': 'fe80:0:0:0:42:17ff:feff:83f%docker0'
        }
      ],
      systemId: req.params.systemId
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: [data]
      }
    ));
  });
}

module.exports = systemNetwork;
