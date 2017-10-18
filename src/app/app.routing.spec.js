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

  let stateProvider, urlRouterProvider, q, transitions, state, authSvc, refreshPromise;

  beforeEach(() => {
    stateProvider = { state: sinon.spy() };
    urlRouterProvider = { otherwise: sinon.spy() };

    q = sinon.spy();
    q.defer = sinon.stub().returns({
      resolve: sinon.spy(),
      reject: sinon.spy()
    });

    state = {
      target: sinon.stub().returns('stateTarget'),
    };

    refreshPromise = sinon.spy();
    authSvc = {
      login: sinon.spy(),
      logout: sinon.spy(),
      refresh: sinon.stub().returns({
        then: refreshPromise
      }),
      status: () => true,
      goToLogin: sinon.spy()
    };
    transitions = {
      onBefore: sinon.spy(),
      onEnter: sinon.spy()
    };

    module.errorRouting(stateProvider, urlRouterProvider);
    module.transitionHook(q, transitions, state, authSvc);
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
        val.should.equal(require('./shared/templates/404.html'));
        done();
      });
      deferred(resolve);
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

    describe('onEnter hook', () => {
      it('should perform authService refresh on all transitions', () => {
        authSvc.refresh.should.not.be.called();
        let args = transitions.onEnter.args[0];
        args[0].should.be.an.Object();
        args[0].should.deepEqual({});
        args[1].should.be.a.Function();
        args[1]();
        authSvc.refresh.should.be.calledOnce();
      });
    });

    describe('first onBefore hook', () => {
      it('should match root transitions', () => {
        transitions.onBefore.args[0][0].should.have.ownProperty('to');
        transitions.onBefore.args[0][0].to.should.equal('/');
      });

      it('should redirect to jvm-list', () => {
        state.target.should.not.be.called();
        transitions.onBefore.args[0][1].should.be.a.Function();
        let res = transitions.onBefore.args[0][1]();
        state.target.should.be.calledOnce();
        res.should.deepEqual('stateTarget');
      });
    });

    describe('second onBefore hook', () => {
      it('should match non-login transitions', () => {
        transitions.onBefore.args[1][0].should.have.ownProperty('to');
        let fn = transitions.onBefore.args[1][0].to;
        fn.should.be.a.Function();
        fn({ name: 'login' }).should.be.false();
      });

      it('should match non-auth\'d transitions', () => {
        authSvc.status = () => false;
        transitions.onBefore.args[1][0].should.have.ownProperty('to');
        let fn = transitions.onBefore.args[1][0].to;
        fn.should.be.a.Function();
        fn({ name: 'foo' }).should.be.true();
      });

      it('should provide a transition function', () => {
        transitions.onBefore.args[1][1].should.be.a.Function();
      });

      it('should call authService.refresh()', () => {
        authSvc.refresh.should.not.be.called();

        transitions.onBefore.args[1][1]();

        authSvc.refresh.should.be.calledOnce();
      });

      it('should resolve on success', () => {
        q.defer().resolve.should.not.be.called();

        transitions.onBefore.args[1][1]();
        refreshPromise.args[0][0]();

        q.defer().resolve.should.be.calledOnce();
      });

      it('should go to login on error', () => {
        q.defer().reject.should.not.be.called();
        authSvc.login.should.not.be.called();

        transitions.onBefore.args[1][1]();
        refreshPromise.args[0][1]();

        authSvc.goToLogin.should.be.calledOnce();
      });
    });
  });

  describe('defaultState', () => {
    it('should add a \'default\' state which redirects to jvmList', () => {
      stateProvider.state.should.be.calledOnce();
      module.defaultState(stateProvider);
      stateProvider.state.should.be.calledTwice();
      stateProvider.state.secondCall.should.be.calledWithMatch('default', { redirectTo: 'jvmList' });
    });
  });

});
