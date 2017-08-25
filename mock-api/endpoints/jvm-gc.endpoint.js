function jvmGc (server) {
  var _ = require('lodash');
  server.init('jvmGc');
  var accumulatedMicros = 1000;
  server.app.get('/jvm-gc/0.0.3/jvms/:jvmId', function (req, res, next) {
    server.logRequest('jvm-gc', req);

    var jvmId = req.params.jvmId;

    var query = req.query.query;
    query = _.split(query, '&');
    var limit = req.query.limit || 1;

    var response = [];
    for (var i = 0; i < limit; i++) {
      if (Math.random() > 0.9) {
        accumulatedMicros = _.floor(accumulatedMicros * 1.1);
      }
      if (accumulatedMicros > 1000000) {
        // clients probably won't like this "rollover", but we don't want to
        // grow unbounded either
        accumulatedMicros = 1000;
      }
      var data = {
        agentId: 'foo-agentId',
        jvmId: jvmId,
        timeStamp: { $numberLong: (Date.now() - i).toString() },
        collectorName: 'fooCollector',
        runCount: { $numberLong: '0' },
        wallTimeInMicros: { $numberLong: accumulatedMicros.toString() }
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

module.exports = jvmGc;
