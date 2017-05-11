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

describe('SystemInfoRouting', () => {

  let module = require('./system-info.routing.js');

  let stateProvider, args, q, ocLazyLoad;
  beforeEach(() => {
    stateProvider = {
      state: sinon.spy()
    };
    module.config(stateProvider);
    args = stateProvider.state.args[0];
    q = sinon.spy();
    ocLazyLoad = {
      load: sinon.spy()
    };
  });

  describe('stateProvider', () => {
    it('should call $stateProvider.state', () => {
      stateProvider.state.should.be.calledOnce();
    });

    it('should define a \'systemInfo\' state', () => {
      args[0].should.equal('systemInfo');
    });

    it('should map to /system-info/{systemId}', () => {
      args[1].url.should.equal('/system-info/{systemId}');
    });

    it('template provider should return system-info.html', done => {
      let providerFn = args[1].templateProvider[1];
      providerFn.should.be.a.Function();
      providerFn(q);
      q.should.be.calledOnce();

      let deferred = q.args[0][0];
      deferred.should.be.a.Function();

      let resolve = sinon.stub().callsFake(val => {
        val.should.equal(require('./system-info.html'));
        done();
      });
      deferred(resolve);
    });

    it('resolve should load system-info module', done => {
      let resolveFn = args[1].resolve.loadSystemInfo[2];
      resolveFn.should.be.a.Function();
      resolveFn(q, ocLazyLoad);
      q.should.be.calledOnce();

      let deferred = q.args[0][0];
      deferred.should.be.a.Function();

      let resolve = sinon.stub().callsFake(val => {
        ocLazyLoad.load.should.be.calledWith({ name: 'systemInfo' });
        val.should.equal(require('./system-info.module.js'));
        done();
      });
      deferred(resolve);
    });

    it('resolve should provide systemId', () => {
      let resolveFn = args[1].resolve.systemId[1];
      resolveFn.should.be.a.Function();

      let expected = 'foo-systemId';
      let result = resolveFn({ systemId: expected });
      result.should.be.exactly(expected);
    });
  });

});
