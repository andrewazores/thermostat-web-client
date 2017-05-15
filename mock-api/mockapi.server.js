var express = require('express'),
  cors = require('cors'),
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash');

var port = process.env.MOCKAPI_PORT || 8888;
var host = process.env.MOCKAPI_HOST || '0.0.0.0';

var app = express();
app.use(cors());

app.set('port', port);
app.set('host', host);

var endpoints = path.resolve(__dirname, 'endpoints');
fs.readdir(endpoints, 'UTF-8', function (err, files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (_.endsWith(file, '.endpoint.js')) {
      require(path.resolve(endpoints, file))(app);
    }
  }
});

app.listen(app.get('port'), app.get('host'), function () {
  console.log('Mock-API server started on http://' + app.get('host') + ':' + app.get('port'));
});
