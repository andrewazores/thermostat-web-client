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

import { default as authModule, config } from './components/auth/auth.module.js';
import controllerModule from './app-root.controller.js';

describe('AppRootController', () => {

  beforeEach(angular.mock.module($provide => {
    'ngInject';
    $provide.value('$transitions', { onBefore: angular.noop });

    let localStorage = {
      getItem: sinon.stub(),
      hasItem: sinon.stub(),
      removeItem: sinon.spy(),
      setItem: sinon.spy(),
      clear: sinon.spy()
    };
    $provide.value('localStorage', localStorage);
  }));

  beforeEach(() => {
    angular.mock.module(authModule);
    config();
    angular.mock.module(controllerModule);
  });

  ['testing', 'development', 'production'].forEach(env => {
    describe(env, () => {
      let ctrl, scope, authService, translate;
      beforeEach(inject($controller => {
        'ngInject';

        scope = { $on: sinon.spy() };
        authService = {
          status: sinon.stub().returns(true),
          login: sinon.spy(),
          logout: sinon.spy()
        };
        translate = sinon.stub().returns({
          then: sinon.stub().yields(
            {
              'navbar.states.JVM_LISTING': 'JVM Listing',
              'navbar.states.MULTICHARTS': 'Multicharts'
            }
          )
        });

        ctrl = $controller('AppRootController', {
          environment: env,
          $scope: scope,
          authService: authService,
          $translate: translate
        });
        ctrl.$onInit();
      }));

      it('should set loginStatus', () => {
        ctrl.loginStatus.should.be.True();
        authService.status.should.be.calledOnce();
      });
    });
  });

  describe('logout()', () => {
    let ctrl, scope, authService, translate;
    beforeEach(inject($controller => {
      'ngInject';

      scope = { $on: sinon.spy() };
      authService = {
        status: sinon.stub().returns(true),
        login: sinon.spy(),
        logout: sinon.spy()
      };
      translate = sinon.stub().returns({
        then: sinon.stub().yields(
          {
            'navbar.states.JVM_LISTING': 'JVM Listing',
            'navbar.states.MULTICHARTS': 'Multicharts'
          }
        )
      });

      ctrl = $controller('AppRootController', {
        environment: 'testing',
        $scope: scope,
        authService: authService,
        $translate: translate
      });
      ctrl.$onInit();
    }));

    it('should delegate to AuthService', () => {
      authService.logout.should.not.be.called();
      ctrl.logout();
      authService.logout.should.be.calledOnce();
    });
  });

  describe('username', () => {
    let rootScope, scope, ctrl, authService, translate;
    beforeEach(inject(($controller, $rootScope) => {
      'ngInject';

      rootScope = $rootScope;
      scope = $rootScope.$new();
      authService = {
        status: sinon.stub().returns(true),
        login: sinon.spy(),
        logout: sinon.spy(),
        username: 'fake-username'
      };
      translate = sinon.stub().returns({
        then: sinon.stub().yields(
          {
            'navbar.states.JVM_LISTING': 'JVM Listing',
            'navbar.states.MULTICHARTS': 'Multicharts'
          }
        )
      });

      ctrl = $controller('AppRootController', {
        $scope: scope,
        environment: 'testing',
        authService: authService,
        $translate: translate
      });
      ctrl.$onInit();
    }));

    it('should be set on init', () => {
      ctrl.should.have.ownProperty('username');
      ctrl.username.should.equal(authService.username);
    });

    it('should be set on userLoginChanged according to authService username', () => {
      authService.username = 'new-username';
      rootScope.$broadcast('userLoginChanged');
      ctrl.should.have.ownProperty('username');
      ctrl.username.should.equal(authService.username);
    });
  });

});
