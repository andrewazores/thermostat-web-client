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

export default class BasicAuthService {

  constructor ($state) {
    'ngInject';
    this.$state = $state;
    this.state = false;

    this._user = null;
    this._pass = null;
  }

  status () {
    return this.state;
  }

  login (user, pass, success = angular.noop) {
    this._user = user;
    this._pass = pass;
    this.state = true;
    success();
  }

  logout (callback = angular.noop) {
    this._user = null;
    this._pass = null;
    this.state = false;
    this.$state.go('login');
    callback();
  }

  refresh () {
    return {
      success: function (fn) {
        fn();
        return this;
      },
      error: function () {
        return this;
      }
    };
  }

  get authHeader () {
    return 'Basic ' + btoa(this._user + ':' + this._pass);
  }

  get username () {
    return this._user;
  }

  getCommandChannelUrl (baseUrl) {
    let parsed = url.parse(baseUrl);
    if (this._user == null && this._pass == null) {
      // no-op
    }
    if (this._user != null && this._pass == null) {
      parsed.auth = this._user;
    }
    if (this._user != null && this._pass != null) {
      parsed.auth = this.username + ':' + this._pass;
    }
    return url.format(parsed);
  }

}
