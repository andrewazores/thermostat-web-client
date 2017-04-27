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
 *
 * --------------------------------------------------------------------------------
 * Additional files and licenses
 * --------------------------------------------------------------------------------
 *
 * Thermostat uses Font Awesome by Dave Gandy (http://fontawesome.io) as primary
 * icon resource, distributed under the SIL OFL 1.1 (http://scripts.sil.org/OFL).
 * A copy of the OFL 1.1 license is also included and distributed with Thermostat.
 */

describe('AppController', () => {

  beforeEach(angular.mock.module('appModule'));

  ['testing', 'development', 'production'].forEach(env => {
    describe(env + ' $scope', () => {
      let scope, authService;
      beforeEach(inject(($controller, $rootScope) => {
        'ngInject';

        scope = $rootScope.$new();
        authService = {
          status: sinon.stub().returns(true),
          login: sinon.spy(),
          logout: sinon.spy()
        };

        $controller('AppController', {
          $scope: scope,
          $state: { go: angular.noop },
          environment: env,
          authService: authService
        });
      }));

      it('should set loginStatus', () => {
        scope.should.have.ownProperty('loginStatus');
        scope.loginStatus.should.be.a.Function();

        authService.status.should.be.calledOnce();
        scope.loginStatus();
        authService.status.should.be.calledTwice();
      });

      if (env === 'production') {
        it('should not copy env to $scope', () => {
          scope.should.not.have.ownProperty('env');
        });
      } else {
        it('should copy env to $scope', () => {
          scope.should.have.ownProperty('env');
          scope.env.should.equal(env);
        });
      }
    });
  });

  describe('$scope.logout()', () => {
    let scope, authService, stateGo;
    beforeEach(inject(($controller, $rootScope) => {
      'ngInject';

      scope = $rootScope.$new();
      stateGo = sinon.spy();
      authService = {
        status: sinon.stub().returns(true),
        login: sinon.spy(),
        logout: sinon.spy()
      };

      $controller('AppController', {
        $scope: scope,
        $state: { go: stateGo },
        Environment: 'testing',
        authService: authService
      });
    }));

    it('should exist', () => {
      scope.should.have.ownProperty('logout');
      scope.logout.should.be.a.Function();
    });

    it('should delegate to AuthService', () => {
      authService.logout.should.not.be.called();
      scope.logout();
      authService.logout.should.be.calledOnce();
    });
  });

  describe('when logged in', () => {
    let scope, authStatus, stateGo;
    beforeEach(inject(($controller, $rootScope, authService) => {
      'ngInject';

      scope = $rootScope.$new();

      authStatus = sinon.stub(authService, 'status').returns(true);
      stateGo = sinon.spy();

      $controller('AppController', {
        $scope: scope,
        $state: { go: stateGo },
        environment: 'testing',
        authService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
    });

    it('should redirect to landing', () => {
      authStatus.should.be.calledOnce();
      stateGo.should.be.calledWith('landing');
    });
  });

  describe('when logged out', () => {
    let scope, authStatus, stateGo;
    beforeEach(inject(($controller, $rootScope, authService) => {
      'ngInject';

      scope = $rootScope.$new();

      authStatus = sinon.stub(authService, 'status').returns(false);
      stateGo = sinon.spy();

      $controller('AppController', {
        $scope: scope,
        $state: { go: stateGo },
        environment: 'testing',
        authService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
    });

    it('should redirect to login', () => {
      authStatus.should.be.calledOnce();
      stateGo.should.be.calledWith('login');
    });
  });

});
