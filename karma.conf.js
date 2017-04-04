module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'should-sinon', 'sinon', 'should'],

    files: [
      'src/tests.webpack.js',
      'test/**.test.js'
    ],

    preprocessors: {
      'src/tests.webpack.js': ['webpack', 'sourcemap']
    },

    reporters: ['mocha', 'beep'],

    exclude: [],

    port: 9876,

    colors: true,

    browsers: ['PhantomJS'],

    plugins: [
      require('karma-sinon'),
      require('karma-should'),
      require('karma-should-sinon')
    ],

    webpack: require('./webpack.config'),

    webpackMiddleware: {
      noInfo: 'errors-only'
    },

    singleRun: true
  });
};
