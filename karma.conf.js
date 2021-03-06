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

var webpack = require('webpack');
var path = require('path');
var webpackConfig = require('./webpack.config');
module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'should-sinon', 'sinon', 'should', 'karma-typescript'],

    files: [
      'src/app/components/auth/keycloak.stub.js',
      'src/tests.webpack.js'
    ],

    preprocessors: {
      'src/app/components/auth/keycloak.stub.js': ['webpack', 'sourcemap'],
      'src/tests.webpack.js': ['webpack', 'sourcemap']
    },

    reporters: ['mocha', 'beep', 'junit', 'coverage-istanbul', 'karma-typescript'],

    junitReporter: {
      outputDir: 'test-reports'
    },

    coverageIstanbulReporter: {
      reports: ['text-summary', 'html', 'cobertura'],
      fixWebpackSourcePaths: true,

      'report-config': {
        html: {
          subdir: 'html'
        }
      }
    },

    client: {
      mocha: {
        timeout: 0
      }
    },

    exclude: [],

    port: 9876,

    singleRun: true,

    captureTimeout: 60000, // one minute

    browserDisconnectTimeout: 60000,

    browserDisconnectTolerance: 3,

    browserNoActivityTimeout: 60000,

    retryLimit: 3,

    colors: true,

    browsers: ['PhantomJS'],

    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
      devtool: webpackConfig.devtool,
      plugins: [
        new webpack.ContextReplacementPlugin(
          /(.+)?angular(\\|\/)core(.+)?/,
          path.join(__dirname, 'src')
        )
      ]
    },

    webpackMiddleware: {
      noInfo: 'errors-only'
    }
  });
};
