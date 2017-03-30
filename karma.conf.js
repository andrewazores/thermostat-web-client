module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'should-sinon', 'sinon', 'should'],

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-route/angular-route.js',

      'src/**/*.module.js',

      'src/**/*.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'test/**/*.test.js'
    ],

    reporters: ['mocha', 'beep'],

    exclude: [],

    port: 9876,

    colors: true,

    browsers: ['PhantomJS', 'Firefox'],

    singleRun: true
  });
};
