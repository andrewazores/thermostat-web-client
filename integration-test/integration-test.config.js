/**
 * Copyright 2012-2017 Red Hat, Inc.
 *
 * Thermostat is distributed under the GNU General Public License,
 * version 2 or any later version (with a special exception described
 * below, commonly known as the "Classpath Exception").
 *
 * A copy of GNU General Public License (GPL) is included in this
 * distribution, in the file COPYING.
 *
 * Linking Thermostat code with other modules is making a combined work
 * based on Thermostat.  Thus, the terms and conditions of the GPL
 * cover the whole combination.
 *
 * As a special exception, the copyright holders of Thermostat give you
 * permission to link this code with independent modules to produce an
 * executable, regardless of the license terms of these independent
 * modules, and to copy and distribute the resulting executable under
 * terms of your choice, provided that you also meet, for each linked
 * independent module, the terms and conditions of the license of that
 * module.  An independent module is a module which is not derived from
 * or based on Thermostat code.  If you modify Thermostat, you may
 * extend this exception to your version of the software, but you are
 * not obligated to do so.  If you do not wish to do so, delete this
 * exception statement from your version.
 */

var fs = require('fs'),
  path = require('path'),
  glob = require('glob'),
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
  specs: ['test-env.js'].concat(glob.sync(__dirname + '/specs/**/*.spec.js'))
};
