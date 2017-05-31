var fs = require('fs'),
  path = require('path'),
  _ = require('lodash');

var host = 'localhost';
if (process.env.HOST) {
  host = process.env.HOST;
}

var port = 8080;
if (process.env.PORT) {
  port = process.env.PORT;
}

exports.config = {
  framework: 'mocha',
  mochaOpts: {
    reporter: 'mocha-multi',
    reporterOptions: {
      'mocha-junit-reporter': {
        stdout: '-',
        options: {
          mochaFile: './test-reports/integration-tests.xml'
        }
      },
      spec: '-'
    },
    timeout: 60000, // 60_000ms -> one minute maximum time per individual test case
    slow: 10000 // test cases taking longer than ten seconds are deemed 'slow' tests
  },
  seleniumAddress: 'http://localhost:4444/wd/hub',
  params: {
    webClientUrl: 'http://' + host + ':' + port + '/'
  },
  specs: ['test-env.js']
          .concat(fs.readdirSync(path.resolve(__dirname, 'specs'))
          .filter(v => _.endsWith(v, '.spec.js'))
          .map(v => 'specs/' + v))
};
