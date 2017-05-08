var express = require('express'),
  path = require('path'),
  cors = require('cors'),
  compression = require('compression');

var port = process.env.PORT || 8080;
var host = process.env.HOST || '0.0.0.0';

var app = express();
app.use(cors());
app.use(compression());

app.use(express.static(path.join(__dirname, 'dist')));

app.set('port', port);
app.set('host', host);

app.get('/system-info/:systemId', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(
    {
      response: {
        systemId: req.params.systemId,
        hostName: req.params.systemId + '-host',
        osName: 'Linux',
        osKernel: '4.10.11-200.fc25.x86_64',
        cpuCount: 4,
        cpuModel: 'GenuineIntel',
        totalMemory: 16384
      }
    }
  ));
  next();
});

app.listen(app.get('port'), app.get('host'), function () {
  console.log('Server started on http://' + app.get('host') + ':' + app.get('port'));
});
