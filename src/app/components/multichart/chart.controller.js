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
import services from 'shared/services/services.module.js';
import filters from 'shared/filters/filters.module.js';

class MultiChartController {
  constructor (multichartService, $scope, $interval, dateFilter, DATE_FORMAT, $translate) {
    this.svc = multichartService;
    this.scope = $scope;
    this.interval = $interval;
    this.dateFilter = dateFilter;
    this.dateFormat = DATE_FORMAT;
    this.translate = $translate;
    this.chart = $scope.$parent.chart;

    this.initializeChartData();

    this.scope.$on('$destroy', () => this.stop());

    this.scope.refreshRate = '2000';
    this.scope.dataAgeLimit = '60000';

    this.scope.$watch('refreshRate', (cur, prev) => this.setRefreshRate(cur));
    this.scope.$watch('dataAgeLimit', () => this.trimData());

    this.refresh = $interval(() => this.update(), parseInt(this.scope.refreshRate));
    this.update();
  }

  update () {
    this.svc.getData(this.chart).then(data => {
      let keys = Object.keys(data);
      if (keys.length === 0) {
        return;
      }

      this.chartData.xData.push(Date.now());
      keys.forEach(prop => {
        if (this.chartData.hasOwnProperty(prop)) {
          this.chartData[prop].push(data[prop][1]);
        } else {
          this.chartData[prop] = data[prop];
        }
      });
      this.chartConfig.data.axes = this.svc.getAxesForChart(this.chart);

      this.trimData();
    }, angular.noop);
  }

  stop () {
    if (angular.isDefined(this.refresh)) {
      this.interval.cancel(this.refresh);
      delete this.refresh;
    }
  }

  trimData () {
    if (!angular.isDefined(this.chartData)) {
      return;
    }
    let now = Date.now();
    let oldestLimit = now - parseInt(this.scope.dataAgeLimit);

    while (true) {
      if (this.chartData.xData.length <= 2) {
        break;
      }
      let oldest = this.chartData.xData[1];
      if (oldest < oldestLimit) {
        Object.keys(this.chartData).forEach(key => {
          this.chartData[key].splice(1, 1);
        });
      } else {
        break;
      }
    }
  }

  initializeChartData () {
    this.translate([
      'multicharts.chart.X_AXIS_LABEL',
      'multicharts.chart.X_AXIS_DATA_TYPE'
    ]).then(translations => {
      let self = this;
      this.chartConfig = {
        chartId: 'chart-' + this.chart,
        axis: {
          x: {
            label: translations['multicharts.chart.X_AXIS_LABEL'],
            type: 'timeseries',
            localtime: false,
            tick: {
              format: timestamp => this.dateFilter(timestamp, this.dateFormat.time.medium),
              count: 5
            }
          },
          y: {
            tick: {
              format: d => d
            }
          },
          y2: {
            get show () {
              return self.svc.countServicesForChart(self.chart) > 1;
            }
          }
        },
        tooltip: {
          format: {
            title: x => x,
            value: y => y
          }
        }
      };
      this.chartData = {
        xData: [translations['multicharts.chart.X_AXIS_DATA_TYPE']]
      };
    });
  }

  removeChart () {
    this.svc.removeChart(this.chart);
  }

  setRefreshRate (val) {
    this.stop();
    if (val > 0) {
      this.refresh = this.interval(() => this.update(), val);
    }
  }

  rename (to) {
    if (!to) {
      return;
    }
    to = to.trim();
    if (!this.isValid(to)) {
      return;
    }
    this.svc.rename(this.chart, to);
  }

  isValid (chartName) {
    // TODO: this needs to accept letters outside of the English alphabet
    return chartName.search(/^[\w-]+$/) > -1;
  }
}

export default angular
  .module('multichartChartController', [
    'patternfly',
    'patternfly.charts',
    services,
    filters
  ])
  .controller('MultiChartChartController', MultiChartController)
  .name;
