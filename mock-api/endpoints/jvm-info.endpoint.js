function jvmInfo (server) {
  server.init('jvmInfo');
  server.app.get('/jvm-info/:jvmId', function (req, res, next) {
    server.logRequest('jvm-info', req);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(
      {
        response: {
          jvmId: req.params.jvmId,
          mainClass: 'c.r.t.A',
          startTime: 45000,
          endTime: -1,
          isAlive: true,
          jvmOptions: [
            '-foo',
            '-XX:SomeOption'
          ]
        }
      }
    ));
    next();
  });
}

module.exports = jvmInfo;
