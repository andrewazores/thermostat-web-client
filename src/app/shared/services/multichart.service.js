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

import servicesModule from 'shared/services/services.module.js';
import _ from 'lodash';

export class MultichartService {
  constructor ($q, $translate) {
    this.q = $q;
    this.translate = $translate;
    this.charts = new Map();
  }

  get chartNames () {
    let res = [];
    for (let key of this.charts.keys()) {
      res.push(key);
    }
    res.sort();
    return res;
  }

  countServicesForChart (chartName) {
    if (!this.charts.has(chartName)) {
      return 0;
    }
    return this.charts.get(chartName).length;
  }

  getAxesForChart (chartName) {
    //TODO: make this more intelligent once we start getting extended info
    //back from gateway about what metrics are, the units and context.
    //then we can group similar metrics onto the same axis.
    if (!this.hasChart(chartName)) {
      return {};
    }
    let charts = this.charts.get(chartName);
    let ret = {};

    for (let i = 0; i < this.countServicesForChart(chartName); i++) {
      let axis;
      if (i === 0) {
        axis = 'y';
      } else {
        axis = 'y2';
      }
      ret[charts[i].svcName] = axis;
    }
    return ret;
  }

  getServicesForChart (chartName) {
    if (!this.hasChart(chartName)) {
      return [];
    }
    let charts = this.charts.get(chartName);
    let res = [];
    charts.forEach(chart => res.push(chart.svcName));
    return res;
  }

  addChart (chartName) {
    if (this.charts.has(chartName)) {
      return;
    }
    this.charts.set(chartName, new Array());
  }

  hasChart (chartName) {
    return this.charts.has(chartName);
  }

  removeChart (chartName) {
    if (!this.hasChart(chartName)) {
      return;
    }
    this.charts.delete(chartName);
  }

  addService (chartName, svcName, getFn) {
    if (!this.hasChart(chartName) || this.hasServiceForChart(chartName, svcName)) {
      return;
    }
    let svcs = this.charts.get(chartName);
    svcs.push({
      svcName: svcName,
      getFn: getFn
    });
  }

  hasServiceForChart (chartName, svcName) {
    if (!this.hasChart(chartName)) {
      return false;
    }
    let svcs = this.charts.get(chartName);
    for (let i = 0; i < svcs.length; i++) {
      if (svcs[i].svcName === svcName) {
        return true;
      }
    }
    return false;
  }

  removeService (chartName, svcName) {
    if (!this.hasChart(chartName)) {
      return;
    }
    _.remove(this.charts.get(chartName), svc => svc.svcName === svcName);
  }

  getData (chartName) {
    if (!this.hasChart(chartName)) {
      return new Promise((resolve, reject) => {
        this.translate('services.multichart.NO_SUCH_MULTICHART_ERROR', {
          chartName: chartName
        }).then(s => reject(new Error(s)));
      });
    }

    let svcs = this.charts.get(chartName);
    let promises = [];
    let res = {};
    for (let i = 0; i < svcs.length; i++) {
      let svc = svcs[i];
      let key;
      if (i === 0) {
        key = 'yData';
      } else {
        key = 'yData' + i;
      }
      res[key] = [svc.svcName];
      let promise = svc.getFn();
      promises.push(promise);
      promise.then(data => {
        res[key].push(data);
      });
    }

    return new Promise(resolve => {
      Promise.all(promises).then(() => resolve(res));
    });
  }

  rename (from, to) {
    if (!this.hasChart(from) || this.hasChart(to)) {
      return;
    }
    this.charts.set(to, this.charts.get(from));
    this.charts.delete(from);
  }
}

export function init () {
  angular
    .module(servicesModule)
    .service('multichartService', MultichartService);
}
