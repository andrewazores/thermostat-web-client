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
 *
 * --------------------------------------------------------------------------------
 * Additional files and licenses
 * --------------------------------------------------------------------------------
 *
 * Thermostat uses Font Awesome by Dave Gandy (http://fontawesome.io) as primary
 * icon resource, distributed under the SIL OFL 1.1 (http://scripts.sil.org/OFL).
 * A copy of the OFL 1.1 license is also included and distributed with Thermostat.
 */

// AuthServices are set up before Angular is bootstrapped, so we manually import rather than
// using Angular DI
import KeycloakAuthService from './keycloak-auth.service.js';

describe('KeycloakAuthService', () => {
  let keycloakAuthService;
  let init;
  let logout;
  let promise;
  let authenticated;

  beforeEach(() => {
    promise = sinon.spy();
    init = sinon.stub().returns(promise);
    logout = sinon.spy();
    authenticated = 'invalid-testing-token';
    let mockCloak = {
      init: init,
      logout: logout,
      authenticated: authenticated
    };
    keycloakAuthService = new KeycloakAuthService(mockCloak);
  });

  describe('#init()', () => {
    it('should delegate to keycloak object', () => {
      keycloakAuthService.init();
      init.should.be.calledOnce();
      init.should.be.calledWith({ onLoad: 'login-required' });
    });

    it('should return a promise', () => {
      let res = keycloakAuthService.init();
      res.should.equal(promise);
    });
  });

  describe('#login()', () => {
    it('should call callback', done => {
      keycloakAuthService.login('', '', done);
    });

    it('should not require callback', () => {
      keycloakAuthService.login('', '');
    });

    it('should not interact with keycloak object', done => {
      keycloakAuthService.login('', '', done);
      init.should.not.be.called();
      logout.should.not.be.called();
    });
  });

  describe('#logout()', () => {
    it('should call callback', done => {
      keycloakAuthService.logout(done);
    });

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
});