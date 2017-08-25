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
import BasicAuthService from './basic-auth.service.js';

describe('BasicAuthService', () => {
  let basicAuthService, q, qPromise, state, cookies, rootScope;
  beforeEach(() => {
    qPromise = sinon.stub().yields();
    q = {
      defer: sinon.stub().returns({
        promise: {
          then: qPromise
        },
        resolve: sinon.spy(),
        reject: sinon.spy()
      })
    };
    state = {
      go: sinon.spy(),
      target: sinon.stub().returns('stateTarget')
    };
    cookies = {
      put: sinon.spy(),
      get: sinon.stub(),
      remove: sinon.spy()
    };
    rootScope = { $broadcast: sinon.spy() };
    basicAuthService = new BasicAuthService(q, state, cookies);
    basicAuthService.rootScope = rootScope;
  });

  it('should be initially logged out', () => {
    basicAuthService.status().should.equal(false);
  });

  describe('#login()', () => {
    it('should set logged in status on successful login', done => {
      basicAuthService.login('client', 'client-pwd', () => {
        basicAuthService.status().should.equal(true);
        done();
      });
    });

    it('should set username on successful login', done => {
      should(basicAuthService.username).be.null();
      basicAuthService.login('client', 'client-pwd', () => {
        basicAuthService.username.should.equal('client');
        done();
      });
    });

    it('should not store username in cookies by default', done => {
      basicAuthService.login('client', 'client-pwd', () => {
        cookies.put.should.not.be.called();
        done();
      });
    });

    it('should store username in cookies when set', done => {
      basicAuthService.rememberUser(true);
      basicAuthService.login('client', 'client-pwd', () => {
        cookies.put.should.be.calledOnce();
        cookies.put.should.be.calledWith('username', 'client');
        done();
      });
    });

    it('should broadcast userLoginChanged event', done => {
      rootScope.$broadcast.should.not.be.called();
      basicAuthService.login('client', 'client-pwd', () => {
        rootScope.$broadcast.should.be.calledOnce();
        rootScope.$broadcast.should.be.calledWith('userLoginChanged');
        done();
      });
    });
  });

  describe('#goToLogin()', () => {
    it('should resolve with login state', () => {
      let promise = { resolve: sinon.spy() };
      basicAuthService.goToLogin(promise);
      promise.resolve.should.be.calledOnce();
      promise.resolve.should.be.calledWith('stateTarget');
    });
  });

  describe('#logout()', () => {
    it('should set logged out status', done => {
      basicAuthService.login('client', 'client-pwd');
      basicAuthService.status().should.equal(true);
      basicAuthService.logout(() => {
        basicAuthService.status().should.equal(false);
        done();
      });
    });

    it('should call callback if provided', done => {
      basicAuthService.logout(done);
    });

    it('should not require callback', () => {
      basicAuthService.logout();
    });

    it('should redirect to login', done => {
      let callCount = state.go.callCount;
      basicAuthService.logout(() => {
        state.go.callCount.should.equal(callCount + 1);
        done();
      });
    });

    it('should broadcast userLoginChanged event', done => {
      rootScope.$broadcast.should.not.be.called();
      basicAuthService.logout(() => {
        rootScope.$broadcast.should.be.calledOnce();
        rootScope.$broadcast.should.be.calledWith('userLoginChanged');
        done();
      });
    });
  });

  describe('#refresh()', () => {
    it('should return a Promise', () => {
      let res = basicAuthService.refresh();
      should.exist(res);
      res.should.be.a.Promise();
    });

    it('should call success handler if logged in', done => {
      basicAuthService.login('foo', 'bar', () => {
        basicAuthService.refresh().then(done, angular.noop);
      });
    });

    it('should call error handler if logged out', done => {
      qPromise.callsArg(1);
      basicAuthService.logout();
      basicAuthService.refresh().then(angular.noop, done);
    });
  });

  describe('#get authHeader()', () => {
    it('should return base64-encoded credentials', done => {
      basicAuthService.login('foo', 'bar', () => {
        basicAuthService.authHeader.should.equal('Basic ' + btoa('foo:bar'));
        done();
      });
    });
  });

  describe('#get username()', () => {
    it('should be null before login', () => {
      should(basicAuthService.username).be.null();
    });

    it('should return logged in user', done => {
      basicAuthService.login('foo', 'bar', () => {
        basicAuthService.username.should.equal('foo');
        done();
      });
    });
  });

  describe('#get rememberedUsername()', () => {
    it('should return username stored in cookie', () => {
      cookies.get.returns('fakeUser');
      cookies.get.should.not.be.called();
      basicAuthService.rememberedUsername.should.equal('fakeUser');
      cookies.get.should.be.calledOnce();
    });
  });

  describe('#getCommandChannelUrl()', () => {
    it('should return provided value if not logged in', () => {
      let mockUrl = 'http://example.com:1234/';
      basicAuthService.getCommandChannelUrl(mockUrl).should.equal(mockUrl);
    });

    it('should only add basic auth username when only username provided', done => {
      basicAuthService.login('foo', null, () => {
        basicAuthService.getCommandChannelUrl('http://example.com/').should.equal('http://foo@example.com/');
        done();
      });
    });

    it('should add basic auth username and password when provided', done => {
      basicAuthService.login('foo', 'bar', () => {
        basicAuthService.getCommandChannelUrl('http://example.com/').should.equal('http://foo:bar@example.com/');
        done();
      });
    });
  });

  describe('rememberUser', () => {
    it('should remove username stored in cookie when called with "false"', () => {
      basicAuthService.rememberUser(true);
      cookies.remove.should.not.be.called();
      basicAuthService.rememberUser(false);
      cookies.remove.should.be.calledWith('username');
    });
  });
});
