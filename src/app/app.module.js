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

import 'angular-patternfly';
import '@uirouter/angularjs';
import angularTranslate from 'angular-translate';
import 'angular-translate-interpolation-messageformat';
import 'oclazyload';
import 'bootstrap';
import 'bootstrap-switch';

import 'angular-patternfly/node_modules/patternfly/node_modules/jquery/dist/jquery.js';
import 'angular-patternfly/node_modules/patternfly/node_modules/datatables.net/js/jquery.dataTables.js';
import 'angular-patternfly/node_modules/patternfly/node_modules/datatables.net-select/js/dataTables.select.js';
import 'angularjs-datatables/dist/angular-datatables.min.js';
import 'angularjs-datatables/dist/plugins/select/angular-datatables.select.min.js';

import {default as authModule, config as authModBootstrap} from 'components/auth/auth.module.js';
import authInterceptorFactory from './auth-interceptor.factory.js';

require.ensure([], () => {
  require('angular-patternfly/node_modules/datatables.net-dt/css/jquery.dataTables.css');
  require('angular-patternfly/node_modules/patternfly/dist/css/patternfly.css');
  require('angular-patternfly/node_modules/patternfly/dist/css/patternfly-additions.css');
  require('bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
  require('scss/app.scss');
});

function initializeApplication () {
  return angular
    .module('appModule', [
      'ui.router',
      'ui.bootstrap',
      'patternfly',
      'patternfly.navigation',
      'patternfly.table',
      angularTranslate,
      authModule,
      // non-core modules
      require('./app.routing.js').default,
      require('./app.controller.js').default,
      authInterceptorFactory
    ])
    .config($httpProvider => {
      'ngInject';
      $httpProvider.interceptors.push(authInterceptorFactory);
    })
    .config($translateProvider => {
      'ngInject';
      $translateProvider
        .useSanitizeValueStrategy('escapeParameters')
        .addInterpolation('$translateMessageFormatInterpolation')
        .registerAvailableLanguageKeys(['en'], {
          'en_*': 'en'
        })
        .fallbackLanguage('en')
        .determinePreferredLanguage();

      let req = require.context('./', true, /\/([a-z]{2})\.locale\.yaml$/);
      req.keys().map(key => {
        let lang = /\/([a-z]{2})\.locale\.yaml$/.exec(key)[1];
        let translations = req(key);
        $translateProvider.translations(lang, translations);
      });
    })
    .name;
}

/* istanbul ignore next */
if (window.tmsGatewayUrl) {
  let appModule = initializeApplication();
  authModBootstrap(process.env.NODE_ENV, () => angular.element(() => angular.bootstrap(document, [appModule])));
} else {
  $.get('/gatewayurl')
    .done(res => {
      window.tmsGatewayUrl = res.gatewayUrl;
    })
    .fail(() => {
      let url = require('url');
      let parsed = url.parse(window.location.href);
      let gateway = {
        protocol: parsed.protocol,
        host: parsed.host
      };
      window.tmsGatewayUrl = url.format(gateway);
    })
    .always(() => {
      let appModule = initializeApplication();
      authModBootstrap(process.env.NODE_ENV, () => angular.element(() => angular.bootstrap(document, [appModule])));
    });
}
