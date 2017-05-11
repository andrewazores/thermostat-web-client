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

// AuthServices are set up before Angular is bootstrapped, so we manually import rather than
// using Angular DI
import KeycloakAuthService from './keycloak-auth.service.js';

describe('KeycloakAuthService', () => {

  let keycloakAuthService, login, logout, refresh, authenticated;
  beforeEach(() => {
    login = sinon.spy();
    logout = sinon.spy();

    refresh = sinon.stub().returns('refresh-foo');
    authenticated = 'invalid-testing-token';
    let mockCloak = {
      login: login,
      logout: logout,
      updateToken: refresh,
      authenticated: authenticated
    };
    keycloakAuthService = new KeycloakAuthService(mockCloak);
  });

  describe('#login()', () => {
    it('should call callback', done => {
      keycloakAuthService.login('', '', done);
    });

    it('should not require callback', () => {
      keycloakAuthService.login('', '');
    });

    it('should delegate to Keycloak object', done => {
      keycloakAuthService.login('', '', done);
      logout.should.be.calledOnce();
    });
  });

  describe('#logout()', () => {
    it('should delegate to keycloak object', () => {
      keycloakAuthService.logout();
      logout.should.be.calledOnce();
    });
  });

  describe('#status()', () => {
    it('should delegate to Keycloak object', () => {
      let res = keycloakAuthService.status();
      res.should.equal(authenticated);
    });
  });

  describe('#refresh()', () => {
    it('should delegate to Keycloak object', () => {
      let res = keycloakAuthService.refresh();
      res.should.equal('refresh-foo');
      refresh.should.be.calledOnce();
    });
  });
});
