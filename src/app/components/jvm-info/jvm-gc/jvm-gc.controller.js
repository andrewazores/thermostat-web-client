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
import service from './jvm-gc.service.js';

class JvmGcController {
  constructor (jvmId, $scope, $interval, dateFilter, DATE_FORMAT,
    metricToNumberFilter, jvmGcService, sanitizeService) {
    'ngInject';
    this.jvmId = jvmId;
    this.scope = $scope;
    this.interval = $interval;
    this.dateFilter = dateFilter;
    this.dateFormat = DATE_FORMAT;
    this.metricToNumberFilter = metricToNumberFilter;
    this.jvmGcService = jvmGcService;
    this.scope.sanitize = sanitizeService.sanitize;

    this.scope.refreshRate = '1000';
    this.scope.dataAgeLimit = '30000';

    this.scope.$watch('refreshRate', (cur, prev) => this.setRefreshRate(cur));
    this.scope.$watch('dataAgeLimit', () => this.trimData());

    this.scope.$on('$destroy', () => this.stop());

    this.collectors = [];
    this.chartConfigs = {};
    this.chartData = {};
    this.collectorData = new Map();
    this.constructChartData();

    this.update(parseInt($scope.dataAgeLimit) / parseInt($scope.refreshRate));
  }

  start () {
    this.setRefreshRate(this.scope.refreshRate);
  }

  stop () {
    if (angular.isDefined(this.refresh)) {
      this.interval.cancel(this.refresh);
      delete this.refresh;
    }
  }

  makeConfig (collector) {
    if (_.includes(this.collectors, collector)) {
      return;
    }
    this.collectors.push(collector);
    this.collectors.sort();
    let config = {
      chartId: 'chart-' + collector,
      units: 'microseconds',
      axis: {
        x: {
          label: 'timestamp',
          type: 'timeseries',
          localtime: false,
          tick: {
            format: timestamp => this.dateFilter(timestamp, this.dateFormat.time.medium),
            count: 5
          }
        },
        y: {
          label: 'elapsed',
          tick: {
            format: d => d
          }
        }
      },
      tooltip: {
        format: {
          title: x => 'Time: ' + x,
          value: y => y + ' microseconds'
        }
      },
      transition: {
        duration: 0
      },
      point: {
        r: 0
      },
      onmouseover: () => this.stop(),
      onmouseout: () => this.start()
    };
    this.chartConfigs[collector] = config;
  }

  setRefreshRate (val) {
    this.stop();
    if (val > 0) {
      this.refresh = this.interval(() => this.update(), val);
      this.update();
    }
  }

  trimData() {
    for (let entry of this.collectorData) {
      let collector = entry[0];
      let samples = entry[1];

      let now = Date.now();
      let oldestLimit = now - parseInt(this.scope.dataAgeLimit);

      while (true) {
        let oldest = samples[0];
        if (angular.isDefined(oldest) && oldest.timestamp < oldestLimit) {
          samples.shift();
        } else {
          break;
        }
      }
    }
  }

  constructChartData () {
    for (let entry of this.collectorData) {
      let collector = entry[0];
      let samples = entry[1];

      let data = {
        xData: ['timestamps'],
        yData: [collector]
      };

      for (let i = 1; i < samples.length; i++) {
        let sample = samples[i];
        let lastSample = samples[i - 1];
        data.xData.push(sample.timestamp);
        data.yData.push(sample.micros - lastSample.micros);
      }

      this.chartData[collector] = data;
    }
  }

  update (limit = 1) {
    this.jvmGcService.getJvmGcData(this.jvmId, limit)
      .then(resp => this.processData(resp), angular.noop);
  }

  processData (resp) {
    let seenCollectors = new Set();
    let latestStamp = 0;
    for (let i = resp.data.response.length - 1; i >= 0; i--) {
      let data = resp.data.response[i];
      let collectorName = data.collectorName;
      let timestamp = this.metricToNumberFilter(data.timeStamp);
      let micros = this.metricToNumberFilter(data.wallTimeInMicros);

      seenCollectors.add(collectorName);
      this.makeConfig(collectorName, micros);

      if (!this.collectorData.has(collectorName)) {
        this.collectorData.set(collectorName, []);
      }

      if (timestamp > latestStamp) {
        latestStamp = timestamp;
      }

      let collectorData = this.collectorData.get(collectorName);
      if (collectorData.length === 0) {
        collectorData.push({
          timestamp: timestamp,
          micros: micros
        });
      }
      let last = collectorData[collectorData.length - 1];
      if (timestamp > last.timestamp) {
        collectorData.push({
          timestamp: timestamp,
          micros: micros
        });
      }
    }

    for (let entry of this.collectorData) {
      let collectorName = entry[0];
      let collectorData = entry[1];
      if (!seenCollectors.has(collectorName)) {
        collectorData.push({
          timestamp: latestStamp,
          micros: collectorData[collectorData.length - 1].micros
        });
      }
    }

    this.trimData();

    this.constructChartData();
  }

  multichartFn (collector) {
    return new Promise(resolve => {
      this.jvmGcService.getJvmGcData(this.jvmId, 1, collector).then(resp => {
        resolve(this.metricToNumberFilter(resp.data.response[0].wallTimeInMicros));
      });
    });
  }

}

export default angular
  .module('jvmGc.controller', [
    'patternfly',
    'patternfly.charts',
    service,
    filters
  ])
  .controller('JvmGcController', JvmGcController)
  .name;
