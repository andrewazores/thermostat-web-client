angular
  .module('tms.appModule')
  .controller('tms.appController', ['$location',
    function ($location) {
      'use strict';
      $location.path('/login');
    }
  ]);
