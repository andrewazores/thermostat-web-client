'use strict';

var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';

module.exports = function () {

  var config = {};

  config.entry = isTest ? void 0 : {
    app: './src/app/app.module.js'
  };

  config.resolve = {
    alias: {
      "jquery": "patternfly/node_modules/jquery"
    }
  };

  config.output = isTest ? {} : {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  };

  if (isTest) {
    config.devtool = 'inline-source-map';
  } else {
    config.devtool = 'eval-source-map';
  }

  config.module = {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
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
      test: /\.js$/,
      include: __dirname + '/src/app/',
      loaders: ['istanbul-instrumenter-loader', 'babel-loader']
    }]
  };

  config.plugins = [];

  config.plugins.push(
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jquery": "jquery",
      "window.jQuery": "jquery"
    })
  );

  config.plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false
    })
  );

  if (!isTest) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/app/index.html',
        favicon: './src/assets/images/favicon.png',
        inject: 'body'
      })
    )
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
