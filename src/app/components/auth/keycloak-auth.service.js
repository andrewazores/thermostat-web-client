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

export default class KeycloakAuthService {

  constructor (keycloak) {
    this.keycloak = keycloak;
  }

  set rootScope (rootScope) {
    this._rootScope = rootScope;
  }

  login () {
    // no-op
  }

  goToLogin (promise) {
    this.keycloak.login();
    this._rootScope.$broadcast('userLoginChanged');
    promise.resolve();
  }

  logout (callback = angular.noop) {
    this._rootScope.$broadcast('userLoginChanged');
    this.keycloak.logout();
    callback();
  }

  status () {
    return this.keycloak.authenticated;
  }

  refresh () {
    // refresh the token if it expires within 300 seconds
    return this.keycloak.updateToken(300);
  }

  get authHeader () {
    return 'Bearer ' + this.keycloak.token;
  }

  get username () {
    return this.keycloak.idTokenParsed.preferred_username;
  }

  getCommandChannelUrl (baseUrl) {
    let parsed = url.parse(baseUrl);
    parsed.query = { access_token: this.keycloak.token };
    return url.format(parsed);
  }

}
