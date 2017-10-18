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

import service from '../byteman.service.js';
import _ from 'lodash';

const REFRESH_RATE = 5000; // five seconds
const MAX_DATA_AGE = 600000; // ten minutes;

class BytemanMetricsController {
  constructor ($stateParams, $translate, $interval, bytemanService,
    metricToNumberFilter, timestampToDateFilter) {
    'ngInject';
    this.jvmId = $stateParams.jvmId;
    this._translate = $translate;
    this._interval = $interval;
    this._svc = bytemanService;
    this._metricToNumber = metricToNumberFilter;

    this.config = {
      selectionMatchProp: 'timestamp',
      showCheckBoxes: false,
      itemsAvailable: false
    };

    this.items = [];

    this._dataAgeLimit = MAX_DATA_AGE;

    this._translate([
      'byteman.metrics.TIMESTAMP_COL_HEADER',
      'byteman.metrics.MARKER_COL_HEADER',
      'byteman.metrics.NAME_COL_HEADER',
      'byteman.metrics.VALUE_COL_HEADER'
    ]).then(translations => {
      this.columns = [
        {
          itemField: 'timestamp',
          header: translations['byteman.metrics.TIMESTAMP_COL_HEADER'],
          templateFn: timestampToDateFilter
        },
        { itemField: 'marker', header: translations['byteman.metrics.MARKER_COL_HEADER'] },
        { itemField: 'name', header: translations['byteman.metrics.NAME_COL_HEADER'] },
        { itemField: 'value', header: translations['byteman.metrics.VALUE_COL_HEADER'] }
      ];
    });
  }

  $onInit () {
    this._update();
    this._refresh = this._interval(() => this._update(), REFRESH_RATE);
  }

  $onDestroy () {
    if (angular.isDefined(this._refresh)) {
      this._interval.cancel(this._refresh);
    }
  }

  set dataAgeLimit (val) {
    this._dataAgeLimit = val;
    this._update();
  }

  get dataAgeLimit () {
    return this._dataAgeLimit.toString();
  }

  _update () {
    this._svc.getMetrics(this.jvmId, Date.now() - this._dataAgeLimit).then(res => {
      this.items = res;
      this.config.itemsAvailable = true;
    });
  }
}

export default angular
  .module('byteman.metrics.controller', [service])
  .controller('BytemanMetricsController', BytemanMetricsController)
  .name;
