var loginModule = angular.module('tms.loginModule', ['ngRoute']);

loginModule.config(
  ['$routeProvider',
    function ($routeProvider) {
      'use strict';
      $routeProvider

        .when('/login', {
          templateUrl: 'src/login/login.html'
        });
    }
  ]
);
