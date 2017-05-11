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

import 'angular-patternfly';
import '@uirouter/angularjs';
import 'oclazyload';
import 'es6-promise/auto';

import {default as CFG_MODULE} from './shared/config/config.module.js';
import {default as AUTH_MODULE, config as AUTH_MOD_BOOTSTRAP} from './components/auth/auth.module.js';
import './shared/filters/filters.module.js';
import './components/landing/landing.routing.js';
import './components/jvm-list/jvm-list.routing.js';
import './components/jvm-info/jvm-info.routing.js';
import './components/system-info/system-info.routing.js';
import AppController from './app.controller.js';

require.ensure([], () => {
  require('patternfly/dist/css/patternfly.css');
  require('patternfly/dist/css/patternfly-additions.css');
  require('../assets/scss/app.scss');
});

export const appModule = angular.module('appModule',
  [
    'ui.router',
    CFG_MODULE,
    AUTH_MODULE,
    // non-core modules
    'landing.routing',
    'jvmList.routing',
    'jvmInfo.routing',
    'systemInfo.routing'
  ]
).controller('AppController', AppController);

AUTH_MOD_BOOTSTRAP(process.env.NODE_ENV, () => angular.element(
  () => {
    appModule.run(($q, $transitions, authService) => {
      'ngInject';
      $transitions.onBefore({}, () => {
        let defer = $q.defer();
        authService.refresh()
          .success(() => defer.resolve())
          .error(() => {
            defer.reject('Keycloak token update failed');
            authService.login();
          });
        return defer.promise;
      });
    });
    angular.bootstrap(document, [appModule.name])
  }
));
