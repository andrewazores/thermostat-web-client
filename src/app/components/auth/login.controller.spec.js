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
    let scope, authStatus, authLogin, stateGo, alert;
    beforeEach(inject(($controller, $rootScope, authService) => {
      'ngInject';

      scope = $rootScope.$new();

      authStatus = sinon.stub(authService, 'status').returns(false);
      authLogin = sinon.stub(authService, 'login');
      stateGo = sinon.spy();
      alert = sinon.spy(window, 'alert');

      $controller('LoginController', {
        $scope: scope,
        $state: { go: stateGo },
        authService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
      authLogin.restore();
      alert.restore();
    });

    it('should be supplied', () => {
      scope.should.have.ownProperty('login');
    });

    it('should be a function', () => {
      scope.login.should.be.a.Function();
    });

    it('should perform a login', () => {
      authLogin.should.not.be.called();
      stateGo.should.not.be.called();

      scope.login();

      authLogin.should.be.calledOnce();
      let fn = authLogin.args[0][2];
      should.exist(fn);
      fn.should.be.a.Function();
      authLogin.yield();
      stateGo.should.be.calledWith('landing');
    });

    it('should present an alert on failed login', () => {
      authLogin.callsArg(3);
      scope.login();
      alert.should.be.calledWith('Login failed');
    });
  });

  describe('when logged in', () => {
    let scope, authStatus, stateGo;
    beforeEach(inject(($controller, $rootScope, authService) => {
      'ngInject';

      scope = $rootScope.$new();

      authStatus = sinon.stub(authService, 'status').returns(true);
      stateGo = sinon.spy();

      $controller('LoginController', {
        $scope: scope,
        $state: { go: stateGo },
        authService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
    });

    it('should redirect to landing if already logged in', () => {
      authStatus.should.be.calledOnce();
      stateGo.should.be.calledWith('landing');
    });
  });

  describe('when logged out', () => {
    let scope, authStatus, stateGo;
    beforeEach(inject(($controller, $rootScope, authService) => {
      'ngInject';

      scope = $rootScope.$new();
      stateGo = sinon.spy();

      authStatus = sinon.stub(authService, 'status').returns(false);

      $controller('LoginController', {
        $scope: scope,
        $state: {go: stateGo},
        authService: authService
      });
    }));

    afterEach(() => {
      authStatus.restore();
    });

    it('should do nothing if not logged in', () => {
      authStatus.should.be.calledOnce();
      stateGo.should.not.be.called();
    });
  });

});
