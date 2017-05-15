function jvmInfo (app) {
  console.log('mock jvmInfo endpoint up');
  app.get('/jvm-info/:jvmId', function (req, res, next) {
    console.log('jvm-info requested');
    console.log(req.params);
    console.log('~~~~');
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
