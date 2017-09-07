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

import controllerModule from './login.controller.js';

describe('LoginController', () => {

  beforeEach(angular.mock.module(controllerModule));

  describe('#login ()', () => {
    let ctrl, authService, state;
    beforeEach(inject($controller => {
      'ngInject';

      authService = {
        status: sinon.stub().returns(false),
        login: sinon.stub().yields(),
        rememberUser: sinon.spy()
      };

      state = { go: sinon.spy() };

      ctrl = $controller('LoginController', {
        $state: state,
        authService: authService
      });
    }));

    it('should set remember user on authService if set on controller', () => {
      authService.login.should.not.be.called();
      state.go.should.not.be.called();

      ctrl.rememberUser = true;
      ctrl.login();
      authService.login.yield();
      authService.rememberUser.should.be.calledOnce();
      authService.rememberUser.should.be.calledWith(true);
    });

  });

  describe('when logged in', () => {
    let authService, state;
    beforeEach(inject($controller => {
      'ngInject';

      authService = { status: sinon.stub().returns(true) };
      state = { go: sinon.spy() };

      $controller('LoginController', {
        $state: state,
        authService: authService
      });
    }));

    it('should redirect to landing if already logged in', () => {
      authService.status.should.be.calledOnce();
      state.go.should.be.calledWith('landing');
    });
  });

  describe('stored username fill', () => {
    let ctrl, authService, state;
    beforeEach(inject($controller => {
      'ngInject';

      authService = {
        status: sinon.stub().returns(false),
        rememberedUsername: 'foo-user'
      };
      state = { go: sinon.spy() };

      ctrl = $controller('LoginController', {
        $state: state,
        authService: authService
      });
    }));

    it('should fill username from authService if available', () => {
      ctrl.should.have.ownProperty('username');
      ctrl.username.should.equal('foo-user');
      ctrl.should.have.ownProperty('rememberUser');
      ctrl.rememberUser.should.be.true();
    });
  });

});
