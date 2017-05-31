'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = process.env.NODE_ENV === 'production';

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
      'c3': 'angular-patternfly/node_modules/patternfly/node_modules/c3'
    }
  };

  config.output = isTest ? {} : {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  };

  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
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

  if (isProd) {
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

  config.devServer = {
    host: '0.0.0.0',
    contentBase: './src/assets',
    stats: 'minimal',
    inline: true,
    historyApiFallback: true
  };

  return config;
}();
