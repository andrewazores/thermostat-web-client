module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'should-sinon', 'sinon', 'should'],

    files: [
      'src/tests.webpack.js',
      'test/**/*.test.js'
    ],

    preprocessors: {
      'src/tests.webpack.js': ['webpack', 'sourcemap'],
      'test/**/*.test.js': ['webpack']
    },

    reporters: ['mocha', 'beep', 'junit'],

    junitReporter: {
      outputDir: 'test-reports'
    },

    exclude: [],

    port: 9876,

    colors: true,

    browsers: ['PhantomJS'],

    webpack: require('./webpack.config'),

    webpackMiddleware: {
      noInfo: 'errors-only'
    },

    singleRun: true
  });
};
