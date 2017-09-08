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

import controller from './user-prefs.controller.js';

describe('UserPreferencesController', () => {

  let userPrefsSvc, ctrl, bootstrapSwitch;
  beforeEach(() => {
    angular.mock.module(controller);
    angular.mock.inject($controller => {
      'ngInject';
      userPrefsSvc = {
        tlsEnabled: 'fake-state'
      };

      bootstrapSwitch = {
        bootstrapSwitch: sinon.stub().returns(false),
        on: sinon.spy()
      };
      sinon.stub(angular, 'element').returns(bootstrapSwitch);

      ctrl = $controller('UserPreferencesController', {
        userPrefsService: userPrefsSvc
      });
    });
  });

  afterEach(() => {
    angular.element.restore();
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should initialize bootstrap switch', () => {
    bootstrapSwitch.bootstrapSwitch.should.be.calledTwice();
    bootstrapSwitch.bootstrapSwitch.secondCall.should.be.calledWith('state', 'fake-state');
  });

  it('should handle switch change event', () => {
    bootstrapSwitch.on.should.be.calledOnce();
    bootstrapSwitch.on.should.be.calledWith('switchChange.bootstrapSwitch', sinon.match.func);
    let func = bootstrapSwitch.on.args[0][1];
    bootstrapSwitch.bootstrapSwitch.returns('new-state');
    func();
    userPrefsSvc.tlsEnabled.should.equal('new-state');
  });

  it('should delegate tlsEnabled set to service', () => {
    userPrefsSvc.tlsEnabled.should.equal('fake-state');
    ctrl.tlsEnabled = true;
    userPrefsSvc.tlsEnabled.should.be.true();
  });

  it('should delegate tlsEnabled get to service', () => {
    ctrl.tlsEnabled.should.equal('fake-state');
    userPrefsSvc.tlsEnabled = 'new-state';
    ctrl.tlsEnabled.should.equal('new-state');
  });

});
