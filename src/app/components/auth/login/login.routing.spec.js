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

describe('LoginRouting', () => {

  let module = require('./login.routing.js');

  let urlRouterProvider, stateProvider, q, ocLazyLoad;
  beforeEach(() => {
    urlRouterProvider = { when: sinon.spy() };
    stateProvider = { state: sinon.spy() };
    module.config(urlRouterProvider, stateProvider);
    q = sinon.spy();
    ocLazyLoad = { load: sinon.spy() };
  });

  describe('urlRouterProvider', () => {
    it('should redirect blank path to landing', () => {
      urlRouterProvider.when.should.be.calledWith('', '/landing');
    });
  });

  describe('stateProvider', () => {
    it('should call $stateProvider.state', () => {
      stateProvider.state.should.be.calledOnce();
    });

    it('should define a \'login\' state', () => {
      stateProvider.state.args[0][0].should.equal('login');
    });

    it('should map to /login', () => {
      stateProvider.state.args[0][1].url.should.equal('/login');
    });

    it('resolve should load login component', done => {
      let resolveFn = stateProvider.state.args[0][1].resolve.lazyLoad[2];
      resolveFn.should.be.a.Function();
      resolveFn(q, ocLazyLoad);
      q.should.be.calledOnce();

      let deferred = q.args[0][0];
      deferred.should.be.a.Function();

      let resolve = sinon.stub().callsFake(val => {
        ocLazyLoad.load.should.be.calledWith({ name: require('./login.component.js').default});
        val.should.equal(require('./login.component.js'));
        done();
      });
      deferred(resolve);
    });
  });

});
