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

import controllerModule from './system-info.controller.js';

describe('SystemInfoController', () => {

  beforeEach(angular.mock.module(controllerModule));

  let ctrl, rootScope, interval, infoPromise, translate;
  beforeEach(inject(($q, $rootScope, $controller) => {
    'ngInject';
    rootScope = $rootScope;
    infoPromise = $q.defer();
    interval = sinon.spy();
    translate = sinon.stub().returns({
      then: sinon.stub().yields()
    });

    let systemInfoService = { getSystemInfo: () => infoPromise.promise };
    ctrl = $controller('SystemInfoController', {
      systemId: 'foo-systemId',
      systemInfoService: systemInfoService,
      $interval: interval,
      $translate: translate
    });
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  describe('systemInfo', () => {
    beforeEach(() => {
      ctrl.$onInit();
    });

    it('should set systemInfo when service resolves', done => {
      let response = {
        osName: 'Linux',
        osKernel: '4.10.11-200.fc25.x86_64'
      };
      infoPromise.resolve({
        data: {
          response: [response]
        }
      });
      rootScope.$apply();
      ctrl.should.have.ownProperty('systemInfo');
      ctrl.systemInfo.should.deepEqual(response);
      ctrl.showErr.should.equal(false);
      done();
    });

    it('should set error flag when service rejects', done => {
      infoPromise.reject();
      rootScope.$apply();
      ctrl.should.have.ownProperty('showErr');
      ctrl.showErr.should.equal(true);
      done();
    });
  });

});
