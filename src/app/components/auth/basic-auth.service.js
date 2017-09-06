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

const SESSION_EXPIRY_MINUTES = 15;

export default class BasicAuthService {

  constructor ($q, $state, localStorage) {
    'ngInject';
    this.q = $q;
    this.$state = $state;
    this._localStorage = localStorage;

    this._pass = null;
  }

  set rootScope (rootScope) {
    this._rootScope = rootScope;
  }

  status () {
    return this._sessionIsValid();
  }

  login (user, pass, success = angular.noop) {
    this._pass = pass;
    if (this._rememberUser) {
      this._localStorage.setItem('username', user);
    }

    this._localStorage.setItem('loggedInUser', user);
    this._refreshSession();

    this._rootScope.$broadcast('userLoginChanged');
    success();
  }

  goToLogin (promise) {
    promise.resolve(this.$state.target('login'));
  }

  logout (callback = angular.noop) {
    this._pass = null;
    this.$state.go('login');

    this._localStorage.removeItem('session');
    this._localStorage.removeItem('loggedInUser');

    this._rootScope.$broadcast('userLoginChanged');
    callback();
  }

  _refreshSession () {
    let now = new Date();
    let expiry = new Date(now);
    expiry.setMinutes(now.getMinutes() + SESSION_EXPIRY_MINUTES);
    this._localStorage.setItem('session', expiry);
  }

  _sessionIsValid () {
    if (!this._localStorage.hasItem('session')) {
      return false;
    }
    let session = new Date(this._localStorage.getItem('session'));
    let now = new Date();

    return session.getTime() >= now.getTime();
  }

  refresh () {
    let defer = this.q.defer();
    if (this._sessionIsValid()) {
      this._refreshSession();
      defer.resolve();
    } else {
      this._localStorage.removeItem('session');
      this._localStorage.removeItem('loggedInUser');
      defer.reject();
    }
    return defer.promise;
  }

  get authHeader () {
    return 'Basic ' + btoa(this.username + ':' + this._pass);
  }

  get username () {
    return this._localStorage.getItem('loggedInUser');
  }

  get rememberedUsername () {
    return this._localStorage.getItem('username');
  }

  getCommandChannelUrl (baseUrl) {
    let parsed = url.parse(baseUrl);
    if (this.username == null && this._pass == null) {
      // no-op
    }
    if (this.username != null && this._pass == null) {
      parsed.auth = this.username;
    }
    if (this.username != null && this._pass != null) {
      parsed.auth = this.username + ':' + this._pass;
    }
    return url.format(parsed);
  }

  rememberUser (remember) {
    this._rememberUser = remember;
    if (!remember) {
      this._localStorage.removeItem('username');
    }
  }

}
