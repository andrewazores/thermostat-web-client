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
import 'angular-cookies';
import angularTranslate from 'angular-translate';
import 'angular-translate-interpolation-messageformat';
import 'oclazyload';
import 'bootstrap';
import 'bootstrap-switch';

import configModule from 'shared/config/config.module.js';
import {default as authModule, config as authModBootstrap} from './components/auth/auth.module.js';
import filters from 'shared/filters/filters.module.js';
import services from 'shared/services/services.module.js';
import directives from 'shared/directives/directives.module.js';
import appRouting from './app.routing.js';
import authInterceptorFactory from './auth-interceptor.factory.js';
import AppController from './app.controller.js';

require.ensure([], () => {
  require('angular-patternfly/node_modules/patternfly/dist/css/patternfly.css');
  require('angular-patternfly/node_modules/patternfly/dist/css/patternfly-additions.css');
  require('bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
  require('scss/app.scss');
});

export const appModule = angular
  .module('appModule', [
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    angularTranslate,
    configModule,
    authModule,
    // non-core modules
    services,
    filters,
    directives,
    appRouting,
    authInterceptorFactory,
    AppController
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
  });

authModBootstrap(process.env.NODE_ENV, () => angular.element(() => angular.bootstrap(document, [appModule.name])));
