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

  constructor ($q, $state, $cookies) {
    'ngInject';
    this.q = $q;
    this.$state = $state;
    this.cookies = $cookies;
    this.state = false;

    this._user = null;
    this._pass = null;
  }

  set rootScope (rootScope) {
    this._rootScope = rootScope;
  }

  status () {
    return this.state;
  }

  login (user, pass, success = angular.noop) {
    this._user = user;
    this._pass = pass;
    this.state = true;
    if (this._rememberUser) {
      this.cookies.put('username', user);
    }
    this._rootScope.$broadcast('userLoginChanged');
    success();
  }

  goToLogin (promise) {
    promise.resolve(this.$state.target('login'));
  }

  logout (callback = angular.noop) {
    this._user = null;
    this._pass = null;
    this.state = false;
    this.$state.go('login');
    this._rootScope.$broadcast('userLoginChanged');
    callback();
  }

  refresh () {
    let defer = this.q.defer();
    if (this.state) {
      defer.resolve();
    } else {
      defer.reject();
    }
    return defer.promise;
  }

  get authHeader () {
    return 'Basic ' + btoa(this._user + ':' + this._pass);
  }

  get username () {
    return this._user;
  }

  get rememberedUsername () {
    return this.cookies.get('username');
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

  rememberUser (remember) {
    this._rememberUser = remember;
    if (!remember) {
      this.cookies.remove('username');
    }
  }

}
