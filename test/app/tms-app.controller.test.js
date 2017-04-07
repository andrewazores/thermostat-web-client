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

describe('TmsAppController', () => {

  beforeEach(angular.mock.module('tms.appModule'));

  let scope, location, environment, authService;

  ['testing', 'development', 'production'].forEach(env => {
    describe(env + ' $scope', () => {
      beforeEach(inject(($controller, $rootScope, $location, AuthService) => {
        'ngInject';

        scope = $rootScope.$new();
        location = $location;
        environment = {
          env: env
        };
        authService = AuthService;

        $controller('tmsAppController', {
          $scope: scope,
          $location: location,
          Environment: environment,
          AuthService: authService
        });
      }));

      it('should copy env to $scope', () => {
        scope.should.have.ownProperty('env');
        scope.env.should.equal(env);
      });

      it('should set $scope.displayEnvHeader appropriately', () => {
        scope.should.have.ownProperty('displayEnvHeader');
        scope.displayEnvHeader.should.equal(env !== 'production');
      });
    });
  });

  describe('when logged in', () => {
    let authStatus, locationPath;
    beforeEach(inject(($controller, $rootScope, $location, AuthService) => {
      'ngInject';

      scope = $rootScope.$new();
      location = $location;
      environment = {
        env: 'testing'
      };
      authService = AuthService;

      authStatus = sinon.stub(authService, 'status').returns(true);
      locationPath = sinon.spy(location, 'path');

      $controller('tmsAppController', {
        $scope: scope,
        $location: location,
        Environment: environment,
        AuthService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
      locationPath.restore();
    });

    it('should not redirect', () => {
      authStatus.should.be.calledOnce();
      locationPath.should.not.be.called();
    });
  });

  describe('when logged out', () => {
    let authStatus, locationPath;
    beforeEach(inject(($controller, $rootScope, $location, AuthService) => {
      'ngInject';

      scope = $rootScope.$new();
      location = $location;
      environment = {
        env: 'testing'
      };
      authService = AuthService;

      authStatus = sinon.stub(authService, 'status').returns(false);
      locationPath = sinon.spy(location, 'path');

      $controller('tmsAppController', {
        $scope: scope,
        $location: location,
        Environment: environment,
        AuthService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
      locationPath.restore();
    });

    it('should redirect to login', () => {
      authStatus.should.be.calledOnce();
      locationPath.should.be.calledWith('/login');
    });
  });

});
