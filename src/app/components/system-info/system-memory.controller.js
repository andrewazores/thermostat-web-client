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
import service from './system-info.service.js';

class SystemMemoryController {
  constructor (systemInfoService, $scope, $interval, pfUtils,
    dateFilter, DATE_FORMAT) {
    'ngInject';
    this.svc = systemInfoService;
    this.scope = $scope;
    this.interval = $interval;
    this.dateFilter = dateFilter;
    this.dateFormat = DATE_FORMAT;

    this.scope.refreshRate = '1000';
    this.scope.dataAgeLimit = '30000';

    this.scope.$watch('refreshRate', newRefreshRate => this.setRefreshRate(newRefreshRate));
    this.scope.$watch('dataAgeLimit', () => this.trimData());
    this.scope.$on('$destroy', () => this.stopUpdating());

    this.setupDonutChart();
    this.setupLineChart(pfUtils);

    this.update();
  }

  setupDonutChart () {
    this.donutConfig = {
      chartId: 'systemMemoryDonutChart',
      units: '%'
    };

    this.donutData = {
      used: 0,
      total: 100
    };
  }

  setupLineChart (pfUtils) {
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
          value: memoryValue => { return memoryValue + ' MiB'; }
        }
      },
      transition: { duration: 50 },
      axis: {
        x: {
          type: 'timeseries',
          label: {
            text: 'Time',
            position: 'outer-center'
          },
          tick : {
            format: timestamp => this.dateFilter(timestamp, this.dateFormat.time.medium),
            count: 5,
            fit: false
          }
        },
        y: {
          min: 0,
          padding: 0,
          tick: 10,
          label: {
            text: 'Size (MiB)',
            position: 'outer-middle'
          }
        }
      }
    };

    this.lineData = {
      xData: ['timestamp'],
      yData0: ['Total Memory'],
      yData1: ['Free Memory'],
      yData2: ['Used Memory'],
      yData3: ['Total Swap'],
      yData4: ['Free Swap'],
      yData5: ['Buffers']
    };
  }

  processData (resp) {
    for (let i = resp.data.response.length - 1; i >= 0; i--) {
      let data = resp.data.response[i];
      let free = data.free;
      let total = data.total;
      let used = total - free;
      let usage = Math.round((used) / total * 100);

      // update the memory time series chart
      this.lineConfig.axis.y.max = total;
      this.lineData.xData.push(data.timeStamp);
      this.lineData.yData0.push(total);
      this.lineData.yData1.push(free);
      this.lineData.yData2.push(used);
      this.lineData.yData3.push(data.swapTotal);
      this.lineData.yData4.push(data.swapFree);
      this.lineData.yData5.push(data.buffers);
      this.trimData();

      // update the memory donut chart
      this.donutData.used = usage;
    }
  }

  update () {
    this.svc.getMemoryInfo(this.scope.systemId)
      .then(response => this.processData(response), angular.noop);
  }

  setRefreshRate (refreshRate) {
    this.stopUpdating();
    if (refreshRate > 0) {
      this.refresh = this.interval(() => this.update(), refreshRate);
      this.update();
    }
  }

  stopUpdating () {
    if (angular.isDefined(this.refresh)) {
      this.interval.cancel(this.refresh);
      delete this.refresh;
    }
  }

  trimData () {
    let now = Date.now();
    let oldestLimit = now - parseInt(this.scope.dataAgeLimit);
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
