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
 */

import Keycloak from 'keycloak-js/dist/keycloak.js';

import KeycloakAuthService from './keycloak-auth.service.js';
import StubAuthService from './stub-auth.service.js';
import LoginController from './login.controller.js';

let MOD_NAME = 'authModule';
export default MOD_NAME;

/* istanbul ignore next */
export function config (env, done = angular.noop, keycloakProvider = () => {
  // allows for keycloak.json to be compile-time optional, so it can be missing in development
  // and testing environments
  let req = require.context('./', false, /^\.\/keycloak\.json$/);
  if (req.keys().indexOf('./keycloak.json') !== -1) {
    if (!angular.isDefined(window.Keycloak)) {
      window.Keycloak = Keycloak;
    }
    return window.Keycloak(req('./keycloak.json'));
  }
  throw 'keycloak.json expected but not found';
}) {
  let mod = angular.module(MOD_NAME, ['ui.router']);

  mod.constant('AUTH_MODULE', MOD_NAME);
  mod.controller('LoginController', LoginController);
  mod.config($stateProvider => {
    'ngInject';
    $stateProvider.state('login', {
      url: '/login',
      template: require('./login.html'),
      controller: 'LoginController'
    });
  });

  if (env === 'production') {
    let cloak = keycloakProvider();
    let keycloakAuthService = new KeycloakAuthService(cloak);
    mod.value('authService', keycloakAuthService);

    cloak.init({ onLoad: 'login-required' })
      .success(done)
      .error(() => window.location.reload());
  } else {
    mod.service('authService', StubAuthService);
    done();
  }
}
