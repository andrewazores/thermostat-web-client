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

import authModule from 'components/auth/auth.module.js';

class AppRootController {
  constructor ($scope, environment, authService, $translate) {
    'ngInject';
    this.env = environment;
    this._authService = authService;
    this._translate = $translate;

    $scope.$on('userLoginChanged', () => this._updateUsernameLabel());
  }

  $onInit () {
    angular.element(document.querySelector('#logoutButton')).removeAttr('hidden');
    if (this.env !== 'production') {
      angular.element(document.querySelector('#envHeader')).removeAttr('hidden');
    }

    this._updateUsernameLabel();

    this._translate([
      'navbar.states.JVM_LISTING',
      'navbar.states.MULTICHARTS'
    ]).then(translations => {
      this.navigationItems = [
        {
          title: translations['navbar.states.JVM_LISTING'],
          iconClass: 'fa pficon-domain',
          uiSref: 'jvmList'
        },
        {
          title: translations['navbar.states.MULTICHARTS'],
          iconClass: 'fa pficon-trend-up',
          uiSref: 'multichart'
        }
      ];
    });
  }

  get loginStatus () {
    return this._authService.status();
  }

  logout () {
    return this._authService.logout();
  }

  _updateUsernameLabel () {
    this.username = this._authService.username;
  }

}

export default angular
  .module('appRoot.controller', [authModule])
  .controller('AppRootController', AppRootController)
  .name;
