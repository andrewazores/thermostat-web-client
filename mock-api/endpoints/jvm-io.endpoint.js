function jvmIo (server) {
  var _ = require('lodash');
  server.init('jvmIo');

  server.app.get('/jvm-io/0.0.1/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-io', req);

    var jvmId = req.params.jvmId;
    var limit = req.query.limit;
    var query = req.query.query;

    var since = query.split('timeStamp>=')[1];
    var now = Date.now();
    var elapsed = now - since;
    var count = _.floor(elapsed / 2000);

    var response = [];
    for (var i = count; i >= 0; i--) {
      let date = now - (i * 2000);
      let data = {
        agentId: 'foo-agentId',
        jvmId: jvmId,
        timeStamp: { $numberLong: date.toString() },
        charactersRead: { $numberLong: _.floor(date / 10000000).toString() },
        charactersWritten: { $numberLong: _.floor((date / 12000000)).toString() },
        readSyscalls: { $numberLong: _.floor(date / 20000000).toString() },
        writeSyscalls: { $numberLong: _.floor(date / 30000000).toString() }
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

module.exports = jvmIo;
