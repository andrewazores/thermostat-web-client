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

  let stateProvider, urlRouterProvider, args, q;

  beforeEach(() => {
    stateProvider = { state: sinon.spy() };
    urlRouterProvider = { otherwise: sinon.spy() };
    module.errorRouting(stateProvider, urlRouterProvider);
    args = stateProvider.state.args[0];
    q = sinon.spy();
  });

  describe('stateProvider', () => {
    it('should call $stateProvider.state', () => {
      stateProvider.state.should.be.calledOnce();
    });

    it('should define a \'404\' state', () => {
      args[0].should.equal('404');
    });

    it('template provider should return 404.html', done => {
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
});
