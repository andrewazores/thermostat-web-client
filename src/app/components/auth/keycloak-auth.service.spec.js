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

  let keycloakAuthService, mockCloak, rootScope;
  beforeEach(() => {
    let login = sinon.spy();
    let logout = sinon.spy();
    let refresh = sinon.stub().returns('refresh-foo');
    let authenticated = 'invalid-testing-token';

    mockCloak = {
      login: login,
      logout: logout,
      updateToken: refresh,
      authenticated: authenticated,
      token: 'fakeToken',
      idTokenParsed: {
        'preferred_username': 'client'
      }
    };
    keycloakAuthService = new KeycloakAuthService(mockCloak);

    rootScope = { $broadcast: sinon.spy() };
    keycloakAuthService.rootScope = rootScope;
  });

  describe('#login()', () => {
    it('should be a no-op', () => {
      mockCloak.login.should.not.be.called();
      keycloakAuthService.login();
      mockCloak.login.should.not.be.called();
    });
  });

  describe('#goToLogin()', () => {
    it('should call Keycloak login, then resolve', () => {
      mockCloak.login.should.not.be.called();
      let promise = { resolve: sinon.spy() };
      keycloakAuthService.goToLogin(promise);
      mockCloak.login.should.be.calledOnce();
      promise.resolve.should.be.calledOnce();
    });

    it('should broadcast userLoginChanged event', () => {
      rootScope.$broadcast.should.not.be.called();
      let promise = { resolve: sinon.spy() };
      keycloakAuthService.goToLogin(promise);
      rootScope.$broadcast.should.be.calledOnce();
      rootScope.$broadcast.should.be.calledWith('userLoginChanged');
      promise.resolve.should.be.calledOnce();
    });
  });

  describe('#logout()', () => {
    it('should delegate to keycloak object', () => {
      keycloakAuthService.logout();
      mockCloak.logout.should.be.calledOnce();
    });

    it('should broadcast userLoginChanged event', done => {
      rootScope.$broadcast.should.not.be.called();
      keycloakAuthService.logout(() => {
        rootScope.$broadcast.should.be.calledOnce();
        rootScope.$broadcast.should.be.calledWith('userLoginChanged');
        done();
      });
    });
  });

  describe('#status()', () => {
    it('should delegate to Keycloak object', () => {
      keycloakAuthService.status().should.equal(mockCloak.authenticated);
    });
  });

  describe('#refresh()', () => {
    it('should delegate to Keycloak object', () => {
      mockCloak.updateToken.should.not.be.called();
      let res = keycloakAuthService.refresh();
      res.should.equal('refresh-foo');
      mockCloak.updateToken.should.be.calledOnce();
    });
  });

  describe('#get authHeader()', () => {
    it('should return "Bearer fakeToken"', () => {
      keycloakAuthService.authHeader.should.equal('Bearer fakeToken');
    });
  });

  describe('#get username()', () => {
    it('should delegate to Keycloak object', () => {
      keycloakAuthService.username.should.equal('client');
    });
  });

  describe('#getCommandChannelUrl()', () => {
    it('should add the Keycloak token to the query', () => {
      keycloakAuthService.getCommandChannelUrl('http://example.com/').should.equal('http://example.com/?token=fakeToken');
    });
  });
});
