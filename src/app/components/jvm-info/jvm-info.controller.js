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
import service from './jvm-info.service.js';
import systemService from 'components/system-info/system-info.service.js';

class JvmInfoController {
  constructor ($state, $stateParams, jvmInfoService, killVmService, systemInfoService, $translate) {
    'ngInject';
    this._state = $state;
    this.systemId = $stateParams.systemId;
    this.jvmId = $stateParams.jvmId;
    this.jvmInfoService = jvmInfoService;
    this.killVmService = killVmService;
    this.systemInfoService = systemInfoService;
    this.jvmInfo = {};
    this.showErr = false;
    $translate('jvmInfo.killVm.FAIL_MSG_TITLE').then(s => this.errTitle = s);

    this.systemHostname = this.systemId;
    systemInfoService.getSystemInfo(this.systemId).then(res => this.systemHostname = res.data.response[0].hostname);

    this.update();
  }

  set subView (val) {
    if (val === '') {
      this._state.go('jvmInfo', { systemId: this.systemId, jvmId: this.jvmId });
    } else {
      this._state.go('jvmInfo.' + val, { systemId: this.systemId, jvmId: this.jvmId });
    }
  }

  update () {
    this.jvmInfoService.getJvmInfo(this.systemId, this.jvmId).then(
      res => {
        this.jvmInfo = res.data.response[0];
      },
      () => {
        this.jvmInfo = {};
      }
    );
  }

  killVm () {
    this.killVmService.killVm(this.systemId, this.jvmInfo.agentId, this.jvmId, this.jvmInfo.jvmPid).then(
      response => {
        if (response.status) {
          this.showErr = false;
        } else {
          this.showErr = true;
          this.errMessage = response.reason;
        }
      },
      failure => {
        this.showErr = true;
        this.errMessage = failure;
      }
    ).finally(() => {
      this.update();
    });
  }
}

export default angular
  .module('jvmInfo.controller', [
    'patternfly',
    'ui.bootstrap',
    filters,
    service,
    systemService
  ])
  .controller('JvmInfoController', JvmInfoController)
  .name;
