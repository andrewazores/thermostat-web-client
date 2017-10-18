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

import factoryModule from './auth-interceptor.factory.js';

describe('authInterceptorFactory', () => {

  let authSvc, refreshPromise, interceptor;
  beforeEach(() => {
    angular.mock.module(factoryModule);
    angular.mock.module('authModule', $provide => {
      'ngInject';

      refreshPromise = sinon.spy();
      authSvc = {
        status: sinon.stub().returns('mockStatus'),
        login: sinon.stub().yields(),
        logout: sinon.stub().yields(),
        refresh: sinon.stub().returns({
          then: refreshPromise
        }),
        authHeader: 'Basic foo64'
      };
      $provide.value('authService', authSvc);
    });

    angular.mock.module('authInterceptorFactory');

    angular.mock.inject(authInterceptorFactory => {
      'ngInject';
      interceptor = authInterceptorFactory;
    });
  });

  it('should exist', () => {
    should.exist(interceptor);
  });

  it('should return an interceptor object', () => {
    interceptor.should.be.an.Object();
    interceptor.should.have.properties('request');
    interceptor.should.have.size(1);
  });

  describe('request interceptor', () => {

    let fn;
    beforeEach(() => {
      fn = interceptor.request;
    });

    it('should refresh authService when authHeader exists', () => {
      authSvc.refresh.should.not.be.called();
      fn();
      authSvc.refresh.should.be.calledOnce();
    });

    it('should append header if refresh succeeds', () => {
      let cfg = {};
      fn(cfg);
      refreshPromise.should.be.calledWith(sinon.match.func, sinon.match.func);
      refreshPromise.args[0][0]();
      cfg.should.deepEqual({ headers: { Authorization: 'Basic foo64'} });
    });

    it('should do nothing if refresh fails', () => {
      let cfg = {};
      fn(cfg);
      refreshPromise.should.be.calledWith(sinon.match.func, sinon.match.func);
      refreshPromise.args[0][1]();
      cfg.should.deepEqual({});
    });

    it('should do nothing if authHeader does not exist', () => {
      delete authSvc.authHeader;
      let cfg = {};
      fn(cfg);
      authSvc.refresh.should.not.be.called();
      cfg.should.deepEqual({});
    });

  });

});
