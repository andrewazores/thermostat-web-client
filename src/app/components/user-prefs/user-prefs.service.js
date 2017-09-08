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

import * as url from 'url';

class UserPreferencesService {
  constructor ($cookies) {
    'ngInject';
    this._cookies = $cookies;
  }

  set tlsEnabled (tlsEnabled) {
    this._cookies.put('tlsEnabled', JSON.parse(tlsEnabled));
  }

  get tlsEnabled () {
    let raw = this._cookies.get('tlsEnabled');
    // can't use gatewayUrl value here due to circular reference, but process.env
    // is not available in test suite
    /* istanbul ignore next */
    if (!angular.isDefined(raw)) {
      let protocol = url.parse(process.env.GATEWAY_URL).protocol;
      this.tlsEnabled = protocol === 'https:';
      raw = this._cookies.get('tlsEnabled');
    }
    return JSON.parse(raw);
  }
}

export default angular
  .module('userPrefs.service', ['ngCookies'])
  .service('userPrefsService', UserPreferencesService)
  .name;
