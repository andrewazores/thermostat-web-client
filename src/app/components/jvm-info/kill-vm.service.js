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
import configModule from 'shared/config/config.module.js';
import urlJoin from 'url-join';

class KillVmService {
  constructor ($q, commandChannelService) {
    'ngInject';
    this.q = $q;
    this.commandChannel = commandChannelService;
  }

  getPath (systemId, agentId, jvmId) {
    return urlJoin(
      'commands',
      'v1',
      'actions',
      'kill_vm',
      'systems',
      systemId,
      'agents',
      'testAgent', // TODO: replace with agentId once agent registers itself with correct id
      'jvms',
      jvmId,
      'sequence',
      this.commandChannel.sequence
    );
  }

  killVm (systemId, agentId, jvmId, jvmPid) {
    return this.q((resolve, reject) => {
      this.commandChannel.sendMessage(this.getPath(systemId, agentId, jvmId), { 'vm-pid': jvmPid }).then(
        success => {
          resolve({
            status: success.payload.respType.value === this.commandChannel.responseCodes.OK.value,
            reason: success.payload.respType.message
          });
        },
        reject
      );
    });
  }
}

angular
  .module(servicesModule)
  .service('killVmService', KillVmService);

export default angular
  .module('jvmInfo.killVm.service', [configModule])
  .service('killVmService', KillVmService)
  .name;
