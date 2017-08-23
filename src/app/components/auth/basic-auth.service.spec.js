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
  let basicAuthService, state;
  beforeEach(() => {
    state = { go: sinon.spy() };
    basicAuthService = new BasicAuthService(state);
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
  });

  describe('#refresh()', () => {
    it('should return an object', () => {
      let res = basicAuthService.refresh();
      should.exist(res);
      res.should.be.an.Object();
    });

    it('should return an object with a success callback handler', () => {
      let res = basicAuthService.refresh();
      res.should.have.ownProperty('success');
      res.success.should.be.a.Function();
    });

    it('should return an object with an error callback handler', () => {
      let res = basicAuthService.refresh();
      res.should.have.ownProperty('error');
      res.error.should.be.a.Function();
    });

    it('should call success callbacks', done => {
      basicAuthService.refresh().success(done);
    });

    it('should not call error callbacks', done => {
      basicAuthService.refresh().error(() => {
        done('should not reach here');
      });
      done();
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
});
