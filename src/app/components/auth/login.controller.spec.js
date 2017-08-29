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

describe('LoginController', () => {

  beforeEach(angular.mock.module($provide => {
    'ngInject';
    $provide.value('$transitions', { onBefore: angular.noop });
  }));

  beforeEach(angular.mock.module('appModule'));

  describe('$scope.login()', () => {
    let scope, authService, stateGo, alert;
    beforeEach(inject(($controller, $rootScope) => {
      'ngInject';

      scope = $rootScope.$new();

      authService = {
        status: sinon.stub().returns(false),
        login: sinon.stub().yields(),
        rememberUser: sinon.spy()
      };

      stateGo = sinon.spy();
      alert = sinon.spy(window, 'alert');

      $controller('LoginController', {
        $scope: scope,
        $state: { go: stateGo },
        authService: authService
      });
    }));

    afterEach(() => {
      alert.restore();
    });

    it('should be supplied', () => {
      scope.should.have.ownProperty('login');
    });

    it('should be a function', () => {
      scope.login.should.be.a.Function();
    });

    it('should set remember user on authService if set in scope', () => {
      authService.login.should.not.be.called();
      stateGo.should.not.be.called();

      scope.rememberUser = true;
      scope.login();
      authService.login.yield();
      authService.rememberUser.should.be.calledOnce();
      authService.rememberUser.should.be.calledWith(true);
    });

  });

  describe('when logged in', () => {
    let scope, authService, stateGo;
    beforeEach(inject(($controller, $rootScope) => {
      'ngInject';

      scope = $rootScope.$new();

      authService = {
        status: sinon.stub().returns(true)
      };
      stateGo = sinon.spy();

      $controller('LoginController', {
        $scope: scope,
        $state: { go: stateGo },
        authService: authService
      });
    }));

    it('should redirect to landing if already logged in', () => {
      authService.status.should.be.calledOnce();
      stateGo.should.be.calledWith('landing');
    });
  });

  describe('stored username fill', () => {
    let scope, authService, stateGo;
    beforeEach(inject(($controller, $rootScope) => {
      'ngInject';

      scope = $rootScope.$new();

      authService = {
        status: sinon.stub().returns(false),
        rememberedUsername: 'foo-user'
      };
      stateGo = sinon.spy();

      $controller('LoginController', {
        $scope: scope,
        $state: { go: stateGo },
        authService: authService
      });
    }));

    it('should fill username from authService if available', () => {
      scope.should.have.ownProperty('username');
      scope.username.should.equal('foo-user');
      scope.should.have.ownProperty('rememberUser');
      scope.rememberUser.should.be.true();
    });
  });

});
