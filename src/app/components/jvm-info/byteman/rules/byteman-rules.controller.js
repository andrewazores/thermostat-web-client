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

class BytemanRulesController {
  constructor ($stateParams, $translate, bytemanService) {
    'ngInject';
    this.jvmId = $stateParams.jvmId;
    this.systemId = $stateParams.systemId;
    this._translate = $translate;
    this._svc = bytemanService;

    this.loadedRule = '';
  }

  $onInit () {
    this._updateRules();
  }

  $onDestroy () {
  }

  _updateRules () {
    return this._svc.getLoadedRules(this.jvmId)
      .then(res => {
        this.loadedRule = res;
        this._clearInput();
      });
  }

  _clearInput () {
    this.ruleText = '';
  }

  refresh () {
    return this._updateRules();
  }

  unload () {
    if (!this.loadedRule) {
      return;
    }
    return this._svc.unloadRules(this.systemId, this.jvmId)
      .then(() => this._updateRules());
  }

  push () {
    return this._svc.loadRule(this.systemId, this.jvmId, this.ruleText)
      .then(() => this._updateRules());
  }

  pull () {
    return this._svc.getLoadedRules(this.jvmId)
      .then(res => {
        this.loadedRule = res;
        if (res) {
          this.ruleText = res;
        }
      });
  }

  generateTemplate () {
    return this._svc.getJvmMainClass(this.systemId, this.jvmId)
      .then(mainClass => {
        return this._translate('byteman.rules.RULE_TEMPLATE', { mainClass: mainClass })
          .then(res => this.ruleText = res);
      });
  }
}

export default angular
  .module('byteman.rules.controller', [service])
  .controller('BytemanRulesController', BytemanRulesController)
  .name;
