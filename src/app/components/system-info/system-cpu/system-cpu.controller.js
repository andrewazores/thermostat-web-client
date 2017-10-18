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

import 'c3';
import _ from 'lodash';
import service from './system-cpu.service.js';

class SystemCpuController {
  constructor (systemCpuService, $interval) {
    this._svc = systemCpuService;
    this._interval = $interval;

    this.data = {
      used: 0,
      total: 100
    };

    this.config = {
      chartId: 'cpuChart',
      units: '%'
    };
  }

  $onInit () {
    this._start();
  }

  _start () {
    this._stop();
    this._update();
    this._refresh = this._interval(() => this._update(), 2000);
  }

  _stop () {
    if (angular.isDefined(this._refresh)) {
      this._interval.cancel(this._refresh);
      delete this._refresh;
    }
  }

  $onDestroy () {
    this._stop();
  }

  _update () {
    this._svc.getCpuInfo(this.systemId).then(resp => {
      let cpuInfo = resp.data.response[0];
      this.data = {
        used: _.floor(_.mean(cpuInfo.perProcessorUsage)),
        total: 100
      };
    });
  }

  multichartFn () {
    return new Promise(resolve =>
      this._svc.getCpuInfo(this.systemId).then(resp =>
        resolve(_.floor(_.mean(resp.data.response[0].perProcessorUsage)))
      )
    );
  }
}

export default angular
  .module('systemCpu.controller', [
    'patternfly',
    'patternfly.charts',
    service
  ])
  .controller('SystemCpuController', SystemCpuController)
  .name;
