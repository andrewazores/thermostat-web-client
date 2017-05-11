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

import {config} from './components/auth/auth.module.js';

describe('AppModule', () => {

  beforeEach(angular.mock.module('appModule'));

  let state, rootScope, q, transitions, mockSvc, svcRefreshSuccess, svcRefreshError;
  beforeEach(angular.mock.module($provide => {
    'ngInject';

    svcRefreshError = sinon.stub();
    svcRefreshSuccess = sinon.stub().returns({ error: svcRefreshError });
    mockSvc = {
      login: sinon.spy(),
      logout: sinon.spy(),
      refresh: sinon.stub().returns({
        success: svcRefreshSuccess
      }),
      status: () => true
    };

    state = {
      go: sinon.spy(),
      href: sinon.spy(),
      current: {
        name: 'fooState'
      },
      params: {}
    };

    rootScope = {
      $on: sinon.spy(),
      $apply: sinon.spy(),
      $new: sinon.stub().returns({}),
      $watch: sinon.spy()
    };

    transitions = {
      onBefore: sinon.spy()
    };

    let defer = {
      resolve: sinon.spy(),
      reject: sinon.spy(),
      promise: {}
    };
    q = {
      defer: () => defer
    };

    $provide.value('$state', state);
    $provide.value('$rootScope', rootScope);
    $provide.value('authService', mockSvc);
    $provide.value('$transitions', transitions);
    $provide.value('$q', q);
  }));

  // this is actually provided by the auth.module pseudo-module - see auth.module.spec.js
  describe('auth bootstrap', () => {

    let error, success, init, provider, svc;
    beforeEach(() => {
      error = sinon.spy();
      success = sinon.stub().returns({error: error});
      init = sinon.stub().returns({success: success});
      provider = sinon.stub().returns({init: init});
      config('production', () => {}, provider);

      inject(authService => {
        'ngInject';
        svc = authService;
      });
    });

    it('should provide an authService', () => {
      should.exist(svc);

      svc.should.have.property('status');
      svc.should.have.property('login');
      svc.should.have.property('logout');
      svc.should.have.property('refresh');

      svc.status.should.be.a.Function();
      svc.login.should.be.a.Function();
      svc.logout.should.be.a.Function();
      svc.refresh.should.be.a.Function();
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
      mockSvc.refresh.should.not.be.called();

      transitions.onBefore.args[0][1]();

      mockSvc.refresh.should.be.calledOnce();
    });

    it('should resolve on success', () => {
      q.defer().resolve.should.not.be.called();

      svcRefreshSuccess.yields();
      transitions.onBefore.args[0][1]();

      q.defer().resolve.should.be.calledOnce();
    });

    it('should reject on error', () => {
      q.defer().reject.should.not.be.called();
      mockSvc.login.should.not.be.called();

      svcRefreshError.yields();
      transitions.onBefore.args[0][1]();

      q.defer().reject.should.be.calledOnce();
      mockSvc.login.should.be.calledOnce();
    });
  });

  it('should provide AppController', () => {
    inject(($controller, $rootScope) => {
      'ngInject';
      should.exist($controller('AppController', {
        $scope: $rootScope.$new(),
        environment: 'testing'
      }));
    });
  });

  it('should provide configModule', () => {
    inject(CFG_MODULE => {
      'ngInject';
      should.exist(CFG_MODULE);
      should.exist(angular.module(CFG_MODULE));
    });
  });

  it('should provide authModule', () => {
    inject(AUTH_MODULE => {
      'ngInject';
      should.exist(AUTH_MODULE);
      should.exist(angular.module(AUTH_MODULE));
    });
  });

});
