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
import service from './jvm-io.service.js';
import services from 'shared/services/services.module.js';
import filters from 'shared/filters/filters.module.js';

class JvmIoController {
  constructor (jvmIoService, $interval, $translate, dateFilter, DATE_FORMAT, metricToNumberFilter) {
    'ngInject';
    this._svc = jvmIoService;
    this._interval = $interval;
    this._translate = $translate;
    this._dateFilter = dateFilter;
    this._dateFormat = DATE_FORMAT;
    this._metricToNumber = metricToNumberFilter;

    this._refreshRate = 10000;
    this._dataAgeLimit = 600000;

    this._makeChartConfig();
  }

  $onInit() {
    this._loadHistoricalData();
    this._start();
  }

  $onDestroy () {
    this._stop();
  }

  _makeChartConfig () {
    this._translate([
      'jvmIo.chart.X_LABEL',
      'jvmIo.chart.Y1_LABEL',
      'jvmIo.chart.Y2_LABEL',

      'jvmIo.metrics.timestamp',
      'jvmIo.metrics.charactersRead',
      'jvmIo.metrics.charactersWritten',
      'jvmIo.metrics.readSysCalls',
      'jvmIo.metrics.writeSysCalls',
    ]).then(translations => {
      this.config = {
        type: 'line',
        chartId: 'jvm-io-chart',
        grid: {
          y: {
            show: true
          }
        },
        axis: {
          x: {
            label: translations['jvmIo.chart.X_LABEL'],
            type: 'timeseries',
            localtime: false,
            tick: {
              format: timestamp => this._dateFilter(timestamp, this._dateFormat.time.medium),
              count: 5
            }
          },
          y: {
            label: translations['jvmIo.chart.Y1_LABEL'],
            tick: {
              format: d => d
            }
          },
          y2: {
            show: true,
            label: translations['jvmIo.chart.Y2_LABEL'],
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
        data: {
          x: translations['jvmIo.metrics.timestamp'],
          rows: [
            [
              translations['jvmIo.metrics.timestamp'],
              translations['jvmIo.metrics.charactersRead'],
              translations['jvmIo.metrics.charactersWritten'],
              translations['jvmIo.metrics.readSysCalls'],
              translations['jvmIo.metrics.writeSysCalls']
            ]
          ]
        }
      };
      this.config.data.axes = {};
      this.config.data.axes[translations['jvmIo.metrics.charactersRead']] = 'y';
      this.config.data.axes[translations['jvmIo.metrics.charactersWritten']] = 'y';
      this.config.data.axes[translations['jvmIo.metrics.readSysCalls']] = 'y2';
      this.config.data.axes[translations['jvmIo.metrics.writeSysCalls']] = 'y2';
    });
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
    this._clearData();
    this._dataAgeLimit = val;
    this._loadHistoricalData();
  }

  get dataAgeLimit () {
    return this._dataAgeLimit.toString();
  }

  _start () {
    this._stop();
    this._refresh = this._interval(() => this._update(), this._refreshRate);
  }

  _stop () {
    if (angular.isDefined(this._refresh)) {
      this._interval.cancel(this._refresh);
      delete this._refresh;
    }
  }

  _clearData () {
    let firstRow = this.config.data.rows[0];
    this.config.data.rows = [firstRow];
  }

  _trimData () {
    let now = Date.now();
    let limit = now - this._dataAgeLimit;
    while (this.config.data.rows.length > 1 && this.config.data.rows[1][0] < limit) {
      this.config.data.rows.splice(1, 1);
    }
  }

  _loadHistoricalData () {
    this._svc.getHistoricalData(this.jvmId, Date.now() - this._dataAgeLimit).then(updates =>
      updates.forEach(update => this._processUpdateRow(update)));
  }

  _update () {
    this._svc.getJvmIoData(this.jvmId).then(update => {
      this._processUpdateRow(update);
      this._trimData();
    });
  }

  _processUpdateRow (update) {
    this.config.data.rows.push([
      this._metricToNumber(update.timeStamp),
      this._metricToNumber(update.charactersRead),
      this._metricToNumber(update.charactersWritten),
      this._metricToNumber(update.readSysCalls),
      this._metricToNumber(update.writeSysCalls),
    ]);
  }
}

export default angular
  .module('jvmIo.controller', [
    service,
    services,
    filters,
    'patternfly',
    'patternfly.charts'
  ])
  .controller('JvmIoController', JvmIoController)
  .name;
