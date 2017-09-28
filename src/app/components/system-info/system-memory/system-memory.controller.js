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
import filters from 'shared/filters/filters.module.js';
import service from './system-memory.service.js';

class SystemMemoryController {
  constructor (systemMemoryService, $interval, pfUtils,
    dateFilter, DATE_FORMAT, $translate) {
    'ngInject';
    this._svc = systemMemoryService;
    this._interval = $interval;
    this._dateFilter = dateFilter;
    this._dateFormat = DATE_FORMAT;
    this._translate = $translate;

    this._refreshRate = 1000;
    this._dataAgeLimit = 30000;

    this._setupDonutChart();
    this._setupLineChart(pfUtils);
  }

  $onInit () {
    this._start();
  }

  $onDestroy () {
    this._stop();
  }

  _setupDonutChart () {
    this.donutConfig = {
      chartId: 'systemMemoryDonutChart',
      units: '%'
    };

    this.donutData = {
      used: 0,
      total: 100
    };
  }

  _setupLineChart (pfUtils) {
    this._translate([
      'systemMemory.X_AXIS_LABEL',
      'systemMemory.Y_AXIS_LABEL'
    ]).then(translations => {
      this.lineConfig = {
        chartId: 'systemMemoryLineChart',
        color: {
          pattern: [
            pfUtils.colorPalette.red,    // total memory
            pfUtils.colorPalette.blue,   // free memory
            pfUtils.colorPalette.orange, // used memory
            pfUtils.colorPalette.gold,   // total swap
            pfUtils.colorPalette.purple, // free swap
            pfUtils.colorPalette.green   // buffers
          ]
        },
        grid: { y: {show: true} },
        point: { r: 2 },
        legend : { 'show': true },
        tooltip: {
          format: {
            // TODO: this should be localized too, but c3 doesn't allow for the tooltip
            // formatter to be a promise, only a function, and angular-translate only
            // returns promises
            value: memoryValue => memoryValue + ' MiB'
          }
        },
        transition: { duration: 50 },
        axis: {
          x: {
            type: 'timeseries',
            label: {
              text: translations['systemMemory.X_AXIS_LABEL'],
              position: 'outer-center'
            },
            tick : {
              format: timestamp => this._dateFilter(timestamp, this._dateFormat.time.medium),
              count: 5,
              fit: false
            }
          },
          y: {
            min: 0,
            padding: 0,
            tick: 10,
            label: {
              text: translations['systemMemory.Y_AXIS_LABEL'],
              position: 'outer-middle'
            }
          }
        }
      };
    });

    this._translate([
      'systemMemory.xAxisTypes.TIMESTAMP',
      'systemMemory.xAxisTypes.TOTAL',
      'systemMemory.xAxisTypes.FREE',
      'systemMemory.xAxisTypes.USED',
      'systemMemory.xAxisTypes.SWAP_TOTAL',
      'systemMemory.xAxisTypes.SWAP_FREE',
      'systemMemory.xAxisTypes.BUFFERS'
    ]).then(translations => {
      this.lineData = {
        xData: [translations['systemMemory.xAxisTypes.TIMESTAMP']],
        yData0: [translations['systemMemory.xAxisTypes.TOTAL']],
        yData1: [translations['systemMemory.xAxisTypes.FREE']],
        yData2: [translations['systemMemory.xAxisTypes.USED']],
        yData3: [translations['systemMemory.xAxisTypes.SWAP_TOTAL']],
        yData4: [translations['systemMemory.xAxisTypes.SWAP_FREE']],
        yData5: [translations['systemMemory.xAxisTypes.BUFFERS']]
      };
    });
  }

  _processData (resp) {
    for (let i = resp.data.response.length - 1; i >= 0; i--) {
      let data = resp.data.response[i];
      let free = data.free;
      let total = data.total;
      let used = total - free;
      let usage = Math.round((used) / total * 100);

      let mib = 1024 * 1024;
      // update the memory time series chart
      this.lineConfig.axis.y.max = total / mib;
      this.lineData.xData.push(data.timeStamp);
      this.lineData.yData0.push(total / mib);
      this.lineData.yData1.push(free / mib);
      this.lineData.yData2.push(used / mib);
      this.lineData.yData3.push(data.swapTotal / mib);
      this.lineData.yData4.push(data.swapFree / mib);
      this.lineData.yData5.push(data.buffers / mib);
      this._trimData();

      // update the memory donut chart
      this.donutData.used = usage;
    }
  }

  _start () {
    this._stop();
    this._update();
    this._refresh = this._interval(() => this._update(), this._refreshRate);
  }

  _update () {
    this._svc.getMemoryInfo(this.systemId)
      .then(response => this._processData(response), angular.noop);
  }

  set refreshRate (refreshRate) {
    this._stop();
    this._refreshRate = parseInt(refreshRate);
    if (refreshRate > 0) {
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

  _stop () {
    if (angular.isDefined(this._refresh)) {
      this._interval.cancel(this._refresh);
      delete this._refresh;
    }
  }

  _trimData () {
    let now = Date.now();
    let oldestLimit = now - this._dataAgeLimit;
    while (true) {
      let oldest = this.lineData.xData[1];
      if (angular.isDefined(oldest) && oldest < oldestLimit) {
        this.lineData.xData.splice(1, 1);
        this.lineData.yData0.splice(1, 1);
        this.lineData.yData1.splice(1, 1);
        this.lineData.yData2.splice(1, 1);
        this.lineData.yData3.splice(1, 1);
        this.lineData.yData4.splice(1, 1);
        this.lineData.yData5.splice(1, 1);
      } else {
        break;
      }
    }
  }

  multichartFn () {
    return new Promise(resolve =>
      this._svc.getMemoryInfo(this.systemId).then(resp => {
        let data = resp.data.response[0];
        let free = data.free;
        let total = data.total;
        let used = total - free;
        let usage = Math.round(used / total * 100);
        resolve(usage);
      })
    );
  }

}

export default angular
  .module('systemMemory.controller', [
    'patternfly',
    'patternfly.charts',
    filters,
    service
  ])
  .controller('SystemMemoryController', SystemMemoryController)
  .name;
