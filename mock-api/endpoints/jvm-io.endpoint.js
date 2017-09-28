function jvmIo (server) {
  var _ = require('lodash');
  server.init('jvmIo');

  server.app.get('/jvm-io/0.0.1/jvms/:jvmId', function (req, res) {
    server.logRequest('jvm-io', req);

    var limit = req.query.limit;
    var jvmId = req.params.jvmId;

    var count;
    if (limit == 0) {
      count = 60;
    } else if (limit == 1) {
      count = 0;
    } else {
      count = 0;
    }

    var response = [];
    for (var i = count; i >= 0; i--) {
      let date = Date.now() - (i * 10000);
      let data = {
        agentId: 'foo-agentId',
        jvmId: jvmId,
        timeStamp: { $numberLong: date.toString() },
        charactersRead: { $numberLong: _.floor(date / 10000000).toString() },
        charactersWritten: { $numberLong: _.floor((date / 12000000)).toString() },
        readSysCalls: { $numberLong: _.floor(date / 20000000).toString() },
        writeSysCalls: { $numberLong: _.floor(date / 30000000).toString() }
      };
      response.push(data);
    }
    console.log(response);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: response
      }
    ));
  });
}

module.exports = jvmIo;
