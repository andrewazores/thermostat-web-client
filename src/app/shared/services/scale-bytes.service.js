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

class ScaleBytesService {
  constructor (metricToBigIntService) {
    'ngInject';
    this.metricToBigInt = metricToBigIntService;
  }

  get sizes () {
    return ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  }

  format (bytesMetric, dp = 2) {
    if (!angular.isDefined(bytesMetric)) {
      return {
        result: 0,
        scale: 0,
        unit: ''
      };
    }
    // FIXME: https://trello.com/c/3jDpmy8M/170-clean-up-numberlong-ambiguities
    if (typeof bytesMetric === 'number') {
      bytesMetric = { $numberLong: bytesMetric.toString() };
    }
    const base = 1024;
    let big = this.metricToBigInt.convert(bytesMetric);

    let log = 0;
    while (big.gte(base)) {
      // big.js doesn't support log, so we do this instead
      big = big.div(base);
      log++;
    }

    let scale = Math.pow(1024, log);
    return {
      result: parseFloat(this.metricToBigInt.convert(bytesMetric).div(scale).toFixed(dp)),
      scale: scale,
      unit: this.sizes[log]
    };
  }
}

angular.module('app.services').service('scaleBytesService', ScaleBytesService);
