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
import service from './system-info.service.js';

class SystemInfoController {
  constructor ($stateParams, systemInfoService, $interval, $translate) {
    'ngInject';
    this.systemId = $stateParams.systemId;
    this.showErr = false;
    this._svc = systemInfoService;
    this._interval = $interval;
    this._translate = $translate;
  }

  $onInit () {
    this._translate('systemInfo.ERR_TITLE').then(s => this.errTitle = s);
    this._translate('systemInfo.ERR_MESSAGE').then(s => this.errMessage = s);

    this._svc.getSystemInfo(this.systemId).then(
      resp => {
        this.systemInfo = resp.data.response[0];
        this.showErr = false;
      },
      () => {
        this.showErr = true;
      }
    );
  }
}

export default angular
  .module('systemInfo.controller', [
    'patternfly',
    filters,
    service
  ])
  .controller('SystemInfoController', SystemInfoController)
  .name;
