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

    reporters: ['mocha', 'beep', 'junit', 'coverage-istanbul'],

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
