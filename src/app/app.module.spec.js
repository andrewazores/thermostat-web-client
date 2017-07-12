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

  let state, rootScope;
  beforeEach(angular.mock.module($provide => {
    'ngInject';

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

    $provide.value('$state', state);
    $provide.value('$rootScope', rootScope);
  }));

  // this is actually provided by the auth.module pseudo-module - see auth.module.spec.js
  describe('auth bootstrap', () => {

    let svc;
    beforeEach(() => {
      let mockKeycloakProvider = require('./components/auth/keycloak.stub.js');
      config('production', () => {}, mockKeycloakProvider());

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

  it('should provide authModule', () => {
    inject(AUTH_MODULE => {
      'ngInject';
      should.exist(AUTH_MODULE);
      should.exist(angular.module(AUTH_MODULE));
    });
  });

});
