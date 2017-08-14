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

import filters from 'shared/filters/filters.module.js';
import service from './jvm-list.service.js';
import directives from 'shared/directives/directives.module.js';

class JvmListController {
  constructor (jvmListService, $scope, $location, $timeout, $anchorScroll, $translate) {
    'ngInject';
    this.jvmListService = jvmListService;
    this.scope = $scope;
    this.location = $location;
    this.timeout = $timeout;
    this.anchorScroll = $anchorScroll;

    $translate('jvmList.ERR_TITLE').then(s => $scope.errTitle = s);
    $translate('jvmList.ERR_MESSAGE').then(s => $scope.errMessage = s);

    this.aliveOnly = true;
    let aliveOnlySwitch = angular.element('#aliveOnlyState');
    aliveOnlySwitch.bootstrapSwitch();
    aliveOnlySwitch.on('switchChange.bootstrapSwitch', (event, state) => {
      this.aliveOnly = state;
      this.loadData();
    });

    this.title = 'JVM Listing';
    this.showErr = false;
    this.systemsOpen = {};

    this.loadData();
  }

  loadData () {
    this.jvmListService.getSystems(this.aliveOnly).then(
      resp => {
        this.showErr = false;
        this.systems = resp.data.response;

        for (var i = 0; i < this.systems.length; i++) {
          let system = this.systems[i];
          this.systemsOpen[system.systemId] = false;
        }

        if (this.systems.length === 1) {
          this.systemsOpen[this.systems[0].systemId] = true;
        }

        let hash = this.location.hash();
        if (hash) {
          this.systemsOpen[hash] = true;
        }
        this.onload();
      },
      () => {
        this.showErr = true;
      }
    );
  }

  onload () {
    this.timeout(this.anchorScroll);
  }

}

export default angular
  .module('jvmList.controller', [
    'patternfly',
    filters,
    directives,
    service
  ])
  .controller('JvmListController', JvmListController)
  .name;
