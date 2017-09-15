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

class MultichartChartController {
  constructor (multichartService, $interval, dateFilter, DATE_FORMAT, $translate) {
    this.svc = multichartService;
    this.interval = $interval;
    this.dateFilter = dateFilter;
    this.dateFormat = DATE_FORMAT;
    this.translate = $translate;

    this._refreshRate = 2000;
    this._dataAgeLimit = 60000;
  }

  $onInit () {
    this.initializeChartData().then(() => this.start());
  }

  $onDestroy () {
    this.stop();
  }

  start () {
    this.stop();
    this.update();
    this.refresh = this.interval(() => this.update(), this._refreshRate);
  }

  update () {
    this.svc.getData(this.chart).then(data => {
      let keys = Object.keys(data);
      if (keys.length === 0) {
        return;
      }

      let update = [Date.now()];
      keys.forEach(key => {
        update.push(data[key][1]);
      });
      this.chartConfig.data.rows.push(update);

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
    let now = Date.now();
    let oldestLimit = now - this._dataAgeLimit;

    while (this.chartConfig.data.rows.length > 2) {
      let oldest = this.chartConfig.data.rows[1];
      if (oldest[0] < oldestLimit) {
        this.chartConfig.data.rows.splice(1, 1);
      } else {
        break;
      }
    }
  }

  initializeChartData () {
    return this.translate([
      'multicharts.chart.X_AXIS_LABEL',
      'multicharts.chart.X_AXIS_DATA_TYPE'
    ]).then(translations => {
      let self = this;
      this.chartConfig = {
        chartId: 'chart-' + this.chart,
        grid: {
          y: {
            show: true
          }
        },
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
        data: {
          x: translations['multicharts.chart.X_AXIS_DATA_TYPE'],
          axes: this.svc.getAxesForChart(this.chart),
          rows: [[translations['multicharts.chart.X_AXIS_DATA_TYPE']].concat(this.svc.getServicesForChart(this.chart))]
        },
        tooltip: {
          format: {
            title: x => x,
            value: y => y
          }
        }
      };
    });
  }

  removeChart () {
    this.svc.removeChart(this.chart);
  }

  get refreshRate () {
    return this._refreshRate.toString();
  }

  set refreshRate (val) {
    this.stop();
    if (val > 0) {
      this.refresh = this.interval(() => this.update(), val);
    }
  }

  get dataAgeLimit () {
    return this._dataAgeLimit.toString();
  }

  set dataAgeLimit (val) {
    this._dataAgeLimit = parseInt(val);
    this.trimData();
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
  .controller('MultichartChartController', MultichartChartController)
  .name;
