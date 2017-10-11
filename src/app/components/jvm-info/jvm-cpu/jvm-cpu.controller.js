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

import service from './jvm-cpu.service.js';
import filters from 'shared/filters/filters.module.js';

class JvmCpuController {
  constructor ($stateParams, jvmCpuService, $interval, $translate, dateFilter, DATE_FORMAT, metricToNumberFilter) {
    'ngInject';
    this.jvmId = $stateParams.jvmId;
    this._svc = jvmCpuService;
    this._interval = $interval;
    this._translate = $translate;
    this._dateFilter = dateFilter;
    this._dateFormat = DATE_FORMAT;
    this._metricToNumber = metricToNumberFilter;

    this._refreshRate = 2000;
    this._dataAgeLimit = 30000;

    this._xData = ['timestamp'];
    this._yData = ['CPU Load'];
    this.data = {
      xData: this._xData,
      yData: this._yData
    };
  }

  $onInit () {
    this._makeConfig().then(() => this._start());
  }

  $onDestroy() {
    this._stop();
  }

  _makeConfig () {
    return this._translate([
      'jvmCpu.chart.UNITS',
      'jvmCpu.chart.X_AXIS_LABEL',
      'jvmCpu.chart.Y_AXIS_LABEL'
    ]).then(translations => {
      this.config = {
        chartId: 'jvm-cpu-chart',
        units: translations['jvmCpu.chart.UNITS'],
        axis: {
          x: {
            label: translations['jvmCpu.chart.X_AXIS_LABEL'],
            show: true,
            type: 'timeseries',
            localtime: false,
            tick: {
              format: timestamp => this._dateFilter(timestamp, this._dateFormat.time.medium),
              count: 5
            }
          },
          y: {
            label: translations['jvmCpu.chart.Y_AXIS_LABEL'],
            show: true,
            tick: {
              format: d => d
            }
          }
        },
        tooltip: {
          format: {
            title: x => x,
            value: y => y
          }
        },
        onmouseover: () => this._stop(),
        onmouseout: () => this._start()
      };
    });
  }

  _start () {
    this._stop();
    this._update();
    this._refresh = this._interval(() => this._update(), this.refreshRate);
  }

  _stop () {
    if (angular.isDefined(this._refresh)) {
      this._interval.cancel(this._refresh);
      delete this._refresh;
    }
  }

  _update () {
    this._svc.getJvmCpuData(this.jvmId).then(resp => {
      let data = resp.data.response[0];
      let timestamp = this._metricToNumber(data.timeStamp);
      this._xData.push(timestamp);
      let load = data.cpuLoad;
      this._yData.push(load);

      this._trimData();
    });
  }

  _trimData () {
    let now = Date.now();
    let expiry = now - this._dataAgeLimit;
    while (true) {
      let oldest = this._xData[1];
      if (oldest < expiry) {
        this._xData.splice(1, 1);
        this._yData.splice(1, 1);
      } else {
        break;
      }
    }
  }

  set refreshRate (val) {
    this._stop();
    this._refreshRate = parseInt(val);
    if (this._refreshRate > 0) {
      this._start();
    }
  }

  get refreshRate () {
    return this._refreshRate.toString();
  }

  set dataAgeLimit (val) {
    this._dataAgeLimit = val;
    this._trimData();
  }

  get dataAgeLimit () {
    return this._dataAgeLimit.toString();
  }

  multichartFn () {
    return new Promise(resolve => {
      this._svc.getJvmCpuData(this.jvmId).then(resp => {
        resolve(resp.data.response[0].cpuLoad);
      });
    });
  }
}

export default angular
  .module('jvmCpu.controller', [
    service,
    filters
  ])
  .controller('JvmCpuController', JvmCpuController)
  .name;
