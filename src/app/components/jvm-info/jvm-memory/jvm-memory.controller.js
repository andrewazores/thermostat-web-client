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
import service from './jvm-memory.service.js';

class JvmMemoryController {
  constructor ($stateParams, $interval, jvmMemoryService, metricToBigIntFilter,
    bigIntToStringFilter, stringToNumberFilter, scaleBytesService, sanitizeService) {
    'ngInject';

    this.jvmId = $stateParams.jvmId;
    this._interval = $interval;
    this._jvmMemoryService = jvmMemoryService;
    this._sanitizeService = sanitizeService;

    this._metricToBigInt = metricToBigIntFilter;
    this._bigIntToString = bigIntToStringFilter;
    this._stringToNumber = stringToNumberFilter;
    this._scaleBytes = scaleBytesService;
  }

  $onInit () {
    this.metaspaceData = {
      used: 0,
      total: 0
    };
    this.metaspaceConfig = {
      chartId: 'metaspaceChart',
      units: 'B'
    };
    this.spaceConfigs = [];
    this.generationData = {};

    this._refreshRate = 2000;

    this._start();
  }

  $onDestroy () {
    this._stop();
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

  multichartMetaspace () {
    return new Promise(resolve =>
      this._jvmMemoryService.getJvmMemory(this.jvmId).then(resp =>
        resolve(this.convertMemStat(resp.data.response[0].metaspaceUsed))
      )
    );
  }

  multichartSpace (generationIndex, spaceIndex) {
    return new Promise(resolve =>
      this._jvmMemoryService.getJvmMemory(this.jvmId).then(resp => {
        generationIndex = parseInt(generationIndex);
        spaceIndex = parseInt(spaceIndex);
        let data = resp.data.response[0];
        let generation = data.generations[generationIndex];
        let space = generation.spaces[spaceIndex];
        resolve(this.convertMemStat(space.used));
      })
    );
  }

  _update () {
    this._jvmMemoryService.getJvmMemory(this.jvmId).then(resp => {
      let data = resp.data.response[0];

      let metaspaceScale = this._scaleBytes.format(data.metaspaceUsed);
      this.metaspaceData.used = this.convertMemStat(data.metaspaceUsed, metaspaceScale.scale);
      this.metaspaceData.total = this.convertMemStat(data.metaspaceCapacity, metaspaceScale.scale);
      this.metaspaceConfig.units = metaspaceScale.unit;

      for (let i = 0; i < data.generations.length; i++) {
        let generation = data.generations[i];
        let gen;
        if (this.generationData.hasOwnProperty(i)) {
          gen = this.generationData[i];
        } else {
          gen = {
            index: i,
            name: generation.name,
            collector: generation.collector,
            spaces: []
          };
        }
        for (let j = 0; j < generation.spaces.length; j++) {
          let space = generation.spaces[j];

          let genScale = this._scaleBytes.format(space.used);

          if (gen.spaces.hasOwnProperty(space.index)) {
            gen.spaces[space.index].used = this.convertMemStat(space.used, genScale.scale);
            gen.spaces[space.index].total = this.convertMemStat(space.capacity, genScale.scale);
          } else {
            gen.spaces[space.index] = {
              index: space.index,
              used: this.convertMemStat(space.used, genScale.scale),
              total: this.convertMemStat(space.capacity, genScale.scale)
            };
          }

          let spaceKey = 'gen-' + gen.index + '-space-' + space.index;
          if (!this.spaceConfigs.hasOwnProperty(spaceKey)) {
            this.spaceConfigs[spaceKey] = {
              chartId: spaceKey,
              units: genScale.unit
            };
          } else {
            this.spaceConfigs[spaceKey].units = genScale.unit;
          }
        }
        this.generationData[i] = gen;
      }
    });
  }

  convertMemStat (stat, scale) {
    let bigInt = this._metricToBigInt(stat, scale);
    let str = this._bigIntToString(bigInt);
    let num = this._stringToNumber(str);
    return _.ceil(num);
  }

  sanitize (str) {
    return this._sanitizeService.sanitize(str);
  }

}

export default angular
  .module('jvmMemory.controller', [
    'patternfly',
    'patternfly.charts',
    services,
    filters,
    service
  ])
  .controller('JvmMemoryController', JvmMemoryController)
  .name;
