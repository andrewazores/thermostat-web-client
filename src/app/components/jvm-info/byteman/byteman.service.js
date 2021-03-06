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

import services from 'shared/services/services.module.js';
import config from 'shared/config/config.module.js';
import urlJoin from 'url-join';

const LOAD_RULE_ACTION = 0;
const UNLOAD_RULE_ACTION = 1;
const INITIAL_LISTEN_PORT = -1;
const METRICS_QUERY_LIMIT = 0;

class BytemanService {

  constructor ($q, $http, gatewayUrl, commandChannelService) {
    'ngInject';
    this._q = $q;
    this._http = $http;
    this._gatewayUrl = gatewayUrl;
    this._cmdChan = commandChannelService;

    this._mainClassCache = new Map();
    this._listenPortCache = new Map();
  }

  getLoadedRules (jvmId) {
    return this._getBytemanStatus(jvmId).then(res => {
      if (!res) {
        return '';
      }
      return res.rule;
    });
  }

  loadRule (systemId, jvmId, rule) {
    return this._sendCmdChanRequest(systemId, jvmId, LOAD_RULE_ACTION, rule);
  }

  unloadRules (systemId, jvmId) {
    return this._sendCmdChanRequest(systemId, jvmId, UNLOAD_RULE_ACTION);
  }

  getJvmMainClass (systemId, jvmId) {
    if (this._mainClassCache.has(jvmId)) {
      return this._q(resolve => resolve(this._mainClassCache.get(jvmId)));
    }
    return this._getJvmInfo(systemId, jvmId).then(res => {
      let mainclass = res.mainClass;
      this._mainClassCache.set(jvmId, mainclass);
      return mainclass;
    });
  }

  getMetrics (jvmId, oldestLimit) {
    return this._http.get(urlJoin(this._gatewayUrl, 'jvm-byteman', '0.0.1', 'metrics', 'jvms', jvmId), {
      params: {
        query: `timeStamp>=${oldestLimit}`,
        sort: '-timeStamp',
        limit: METRICS_QUERY_LIMIT
      }
    })
      .then(res => {
        let results = [];
        for (let i = 0; i < res.data.response.length; i++) {
          let metric = res.data.response[i];
          let payload;
          if (typeof metric.payload === 'string') {
            payload = JSON.parse(metric.payload);
          } else {
            payload = metric.payload;
          }
          let prop = Object.getOwnPropertyNames(payload)[0];

          results.push({
            timestamp: metric.timeStamp,
            marker: metric.marker,
            name: prop,
            value: payload[prop]
          });
        }
        return results;
      });
  }

  _sendCmdChanRequest (systemId, jvmId, action, rule) {
    let defer = this._q.defer();

    this._q.all({
      jvmInfo: this._getJvmInfo(systemId, jvmId),
      listenPort: this._getListenPort(jvmId)
    }).then(result => {
      const jvmInfo = result.jvmInfo;
      const agentId = jvmInfo.agentId;
      const pid = jvmInfo.jvmPid;
      const port = result.listenPort;

      let path = urlJoin(
        'commands',
        'v1',
        'actions',
        'byteman',
        'systems',
        systemId,
        'agents',
        agentId,
        'jvms',
        jvmId,
        'sequence',
        this._cmdChan.sequence
      );

      let payload = {
        'byteman-action': action,
        'listen-port': port,
        'vm-pid': pid
      };
      if (rule) {
        payload['byteman-rule'] = rule;
      }
      this._cmdChan.sendMessage(path, payload).then(
        success => {
          defer.resolve({
            status: success.payload.respType.value === this._cmdChan.responseCodes.OK.value,
            reason: success.payload.respType.message
          });
        },
        defer.reject
      );
    });

    return defer.promise;
  }

  _getJvmInfo (systemId, jvmId) {
    return this._http.get(urlJoin(this._gatewayUrl, 'jvms', '0.0.1', 'systems', systemId, 'jvms', jvmId))
      .then(res => {
        return res.data.response[0];
      });
  }

  _getBytemanStatus (jvmId) {
    return this._http.get(urlJoin(this._gatewayUrl, 'jvm-byteman', '0.0.1', 'status', 'jvms', jvmId))
      .then(res => {
        return res.data.response[0];
      });
  }

  _getListenPort (jvmId) {
    if (this._listenPortCache.has(jvmId)) {
      return this._q(resolve => resolve(this._listenPortCache.get(jvmId)));
    }
    return this._getBytemanStatus(jvmId).then(res => {
      if (!res) {
        return INITIAL_LISTEN_PORT;
      }
      let port = res.listenPort;
      this._listenPortCache.set(jvmId, port);
      return port;
    });
  }
}

export default angular
  .module('byteman.service', [
    services,
    config
  ])
  .service('bytemanService', BytemanService)
  .name;
