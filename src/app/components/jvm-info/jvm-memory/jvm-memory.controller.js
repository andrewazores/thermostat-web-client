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

class JvmMemoryController {
  constructor (jvmId, $scope, $interval, jvmMemoryService) {
    'ngInject';

    this.jvmId = jvmId;
    this.scope = $scope;
    this.interval = $interval;
    this.jvmMemoryService = jvmMemoryService;

    this.scope.refreshRate = '2000';

    this.metaspaceData = {
      used: 0,
      total: 0
    };

    this.metaspaceConfig = {
      chartId: 'metaspaceChart',
      units: 'MiB'
    };

    this.spaceConfigs = [];

    this.generationData = {};

    this.scope.$watch('refreshRate', (cur, prev) => this.setRefreshRate(cur));

    this.scope.$on('$destroy', () => this.cancel());

    this.update();
  }

  cancel () {
    if (angular.isDefined(this.refresh)) {
      this.interval.cancel(this.refresh);
    }
  }

  setRefreshRate (val) {
    this.cancel();
    if (val > 0) {
      this.refresh = this.interval(() => this.update(), val);
      this.update();
    }
  }

  update () {
    this.jvmMemoryService.getJvmMemory(this.jvmId).then(resp => {
      let data = resp.data.response[0];
      this.metaspaceData.used = data.metaspaceUsed;
      this.metaspaceData.total = data.metaspaceCapacity;

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
          if (gen.spaces.hasOwnProperty(space.index)) {
            gen.spaces[space.index].used = space.used;
            gen.spaces[space.index].total = space.capacity;
          } else {
            gen.spaces[space.index] = {
              index: space.index,
              used: space.used,
              total: space.capacity
            };
          }
          let spaceKey = 'gen-' + gen.index + '-space-' + space.index;
          if (!this.spaceConfigs.hasOwnProperty(spaceKey)) {
            this.spaceConfigs[spaceKey] = {
              chartId: spaceKey,
              units: 'MiB'
            };
          }
        }
        this.generationData[i] = gen;
      }
    });
  }
}

export default angular.module('jvmMemory.controller',
  [
  ]
).controller('jvmMemoryController', JvmMemoryController);
