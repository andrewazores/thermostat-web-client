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

describe('ErrorRouting', () => {

  let module = require('./app.routing.js');

  let stateProvider, urlRouterProvider, q, transitions, authSvc;

  beforeEach(() => {
    stateProvider = { state: sinon.spy() };
    urlRouterProvider = { otherwise: sinon.spy() };

    q = sinon.spy();
    q.defer = sinon.stub().returns({
      resolve: sinon.spy(),
      reject: sinon.spy()
    });

    let authSvcRefreshError = sinon.stub();
    let authSvcRefreshSuccess = sinon.stub().returns({ error: authSvcRefreshError });
    authSvc = {
      login: sinon.spy(),
      logout: sinon.spy(),
      refresh: sinon.stub().returns({
        success: authSvcRefreshSuccess
      }),
      refreshSuccess: authSvcRefreshSuccess,
      refreshError: authSvcRefreshError,
      status: () => true
    };
    transitions = {
      onBefore: sinon.spy()
    };

    module.errorRouting(stateProvider, urlRouterProvider);
    module.transitionHook(q, transitions, authSvc);
  });

  describe('stateProvider', () => {
    it('should call $stateProvider.state', () => {
      stateProvider.state.should.be.calledOnce();
    });

    it('should define a \'404\' state', () => {
      let args = stateProvider.state.args[0];
      args[0].should.equal('404');
    });

    it('template provider should return 404.html', done => {
      let args = stateProvider.state.args[0];
      let providerFn = args[1].templateProvider[1];
      providerFn.should.be.a.Function();
      providerFn(q);
      q.should.be.calledOnce();

      let deferred = q.args[0][0];
      deferred.should.be.a.Function();

      let resolve = sinon.stub().callsFake(val => {
        val.should.equal(require('./shared/error-templates/404.html'));
        done();
      });
      deferred(resolve);
      done();
    });
  });

  describe('urlRouterProvider.otherwise', () => {
    it('should not called with state as \'404\'', () => {
      urlRouterProvider.otherwise.should.not.be.calledWith('404');
    });

    it('should be called with a function', done => {
      let injectorFn = urlRouterProvider.otherwise.args[0][0];
      let $injector = {
        get: sinon.spy(() => { done(); })
      };
      injectorFn.should.be.a.Function();
      injectorFn($injector);
    });
  });

  describe('state change hook', () => {
    it('should be on state change start', () => {
      transitions.onBefore.should.be.calledOnce();
    });

    it('should match all transitions', () => {
      transitions.onBefore.args[0][0].should.deepEqual({});
    });

    it('should provide a transition function', () => {
      transitions.onBefore.args[0][1].should.be.a.Function();
    });

    it('should call authService.refresh()', () => {
      authSvc.refresh.should.not.be.called();

      transitions.onBefore.args[0][1]();

      authSvc.refresh.should.be.calledOnce();
    });

    it('should resolve on success', () => {
      q.defer().resolve.should.not.be.called();

      authSvc.refreshSuccess.yields();
      transitions.onBefore.args[0][1]();

      q.defer().resolve.should.be.calledOnce();
    });

    it('should reject on error', () => {
      q.defer().reject.should.not.be.called();
      authSvc.login.should.not.be.called();

      authSvc.refreshError.yields();
      transitions.onBefore.args[0][1]();

      q.defer().reject.should.be.calledOnce();
      authSvc.login.should.be.calledOnce();
    });
  });

});
