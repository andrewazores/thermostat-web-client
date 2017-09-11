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

import controllerModule from './system-network.controller.js';

describe('SystemNetworkController', () => {

  beforeEach(angular.mock.module(controllerModule));

  let ctrl, svc;
  beforeEach(inject(($controller) => {
    'ngInject';
    let promise = sinon.spy();
    svc = {
      getNetworkInfo: sinon.stub().returns({
        then: promise
      }),
      promise: promise
    };
    ctrl = $controller('SystemNetworkController', { systemNetworkService: svc });
    ctrl.systemId = 'foo-systemId';
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  describe('networkInfo', () => {
    it('should be called on init', () => {
      svc.getNetworkInfo.should.not.be.called();
      ctrl.$onInit();
      svc.getNetworkInfo.should.be.calledOnce();
    });

    it('should set networkInfo when service resolves', () => {
      let response = {
        interfaceName: 'lo',
        displayName: 'lo',
        ip4Addr: '192.168.1.2',
        ip6Addr: '0:0:0:0:0:0:1%lo'
      };
      svc.promise.should.not.be.called();
      ctrl.$onInit();
      svc.promise.should.be.calledOnce();
      svc.promise.should.be.calledWith(sinon.match.func);
      svc.promise.args[0][0]({
        data: {
          response: [response]
        }
      });
      ctrl.should.have.ownProperty('networkInfo');
      ctrl.networkInfo.should.deepEqual(response);
    });
  });

});
