angular
  .module('tms.loginModule')
  .controller('tms.loginController', ['$scope',
    function ($scope) {
      'use strict';

      $scope.login = function () {
        console.log({username: $scope.username, password: $scope.password});
      };

    }
  ]);
