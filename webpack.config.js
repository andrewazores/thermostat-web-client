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

'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var path = require('path');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = process.env.NODE_ENV === 'production';
var isTesting = process.env.NODE_ENV === 'testing';

module.exports = function () {
  var config = {};

  config.entry = isTest ? void 0 : {
    app: './src/app/app.module.js'
  };

  config.resolve = {
    alias: {
      'jquery': 'angular-patternfly/node_modules/patternfly/node_modules/jquery',
      'angular': 'angular-patternfly/node_modules/angular',
      'd3': 'angular-patternfly/node_modules/patternfly/node_modules/d3',
      'c3': 'angular-patternfly/node_modules/patternfly/node_modules/c3',
      'bootstrap': 'angular-patternfly/node_modules/patternfly/node_modules/bootstrap/dist/js/bootstrap.js',
      'bootstrap-switch': 'angular-patternfly/node_modules/patternfly/node_modules/bootstrap-switch',

      'assets': path.resolve(__dirname, 'src', 'assets'),
      'components': path.resolve(__dirname, 'src', 'app', 'components'),
      'images': 'assets/images',
      'scss': 'assets/scss',
      'shared': path.resolve(__dirname, 'src', 'app', 'shared'),
      'templates': 'shared/templates'
    }
  };

  config.output = isTest ? {} : {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  };

  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd || isTesting) {
    config.devtool = 'source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  config.module = {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.scss$/,
      loader: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'file-loader'
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.locale\.yaml$/,
      loader: ['json-loader', 'yaml-loader']
    }, {
      test: /^(?!.*\.spec\.js$).*\.js$/,
      include: __dirname + '/src/app/',
      loaders: ['istanbul-instrumenter-loader', 'babel-loader']
    }]
  };

  config.plugins = [];

  config.plugins.push(
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jquery': 'jquery',
      'window.jQuery': 'jquery',
      d3: 'd3',
      c3: 'c3'
    })
  );

  config.plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false,
      GATEWAY_URL: 'http://localhost:8888'
    })
  );

  if ((isProd || isTesting) && !isTest) {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      })
    );
  }

  if (!isTest) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/app/index.html',
        favicon: './src/assets/images/favicon.png',
        inject: 'body'
      })
    );
  }

  config.plugins.push(
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$/,
      threshold: 10240,
      minRatio: 0.8
    })
  );

  config.devServer = {
    host: '0.0.0.0',
    contentBase: './src/assets',
    stats: 'minimal',
    inline: true,
    historyApiFallback: true
  };

  return config;
}();
