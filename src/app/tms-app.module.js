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
 *
 * --------------------------------------------------------------------------------
 * Additional files and licenses
 * --------------------------------------------------------------------------------
 *
 * Thermostat uses Font Awesome by Dave Gandy (http://fontawesome.io) as primary
 * icon resource, distributed under the SIL OFL 1.1 (http://scripts.sil.org/OFL).
 * A copy of the OFL 1.1 license is also included and distributed with Thermostat.
 */

import angular from 'angular';

import 'patternfly/dist/css/patternfly.css';
import 'patternfly/dist/css/patternfly-additions.css';
import 'patternfly/dist/js/patternfly.js';
import 'angular-patternfly/dist/angular-patternfly.js';
import 'angular-patternfly/dist/styles/angular-patternfly.css';
import 'angular-bootstrap/ui-bootstrap.js';
import 'angular-bootstrap/ui-bootstrap-tpls.js';
import 'angular-sanitize';
import 'angular-route';
import 'c3/c3.js';
import 'c3/c3.css';
import 'd3';
import '../styles/app/app.css';

import KeycloakAuthService from './keycloak-auth.service.js';
import StubAuthService from './stub-auth.service.js';
import TmsAppController from './tms-app.controller.js';
import TmsLoginController from './tms-login.controller.js';

import Keycloak from 'keycloak-js/dist/keycloak.js';

export const APP_MODULE = 'tms.appModule';

let appModule = angular.module(APP_MODULE, ['ngRoute']);

let environment = require('./environment.json');

if (environment.env === 'production') {

  let keycloak = Keycloak(require('./keycloak.json'));
  let keycloakAuthService = new KeycloakAuthService(keycloak);
  appModule.value('AuthService', keycloakAuthService);

  keycloakAuthService.init({ onLoad: 'login-required' })
    .success(() => {
      angular.element(() => {
        angular.bootstrap(document, [APP_MODULE]);
      });
    })
    .error(() => {
      window.location.refresh();
    });

} else {

  appModule.value('AuthService', new StubAuthService());

  angular.element(function () {
    angular.bootstrap(document, [APP_MODULE]);
  });
}

appModule.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/login', {
      template: require('./login.html')
    });
  }
]);

appModule.controller('tmsAppController', TmsAppController);
appModule.controller('tmsLoginController', TmsLoginController);

appModule.factory('Environment', [
  function Environment () {
    return Object.assign({}, environment);
  }
]);
