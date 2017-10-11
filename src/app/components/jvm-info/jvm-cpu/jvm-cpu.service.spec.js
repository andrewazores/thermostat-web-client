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

import configModule from 'shared/config/config.module.js';
import serviceModule from './jvm-cpu.service.js';

describe('JvmCpuService', () => {

  beforeEach(() => {
    angular.mock.module(configModule, $provide => {
      'ngInject';
      $provide.constant('gatewayUrl', 'http://example.com:1234');
    });

    angular.mock.module(serviceModule);
  });

  let httpBackend, scope, svc;
  beforeEach(inject(($httpBackend, $rootScope, jvmCpuService) => {
    'ngInject';
    httpBackend = $httpBackend;

    scope = $rootScope;
    svc = jvmCpuService;
  }));

  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('getJvmCpuData(jvmId)', () => {
    it('should resolve mock data', done => {
      let expected = {
        cpuLoad: 0.125,
        programTicks: { $numberLong: '1000' },
        timeStamp: { $numberLong: '2000' }
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-cpu/0.0.1/jvms/foo-jvmId?sort=-timeStamp')
        .respond(expected);
      svc.getJvmCpuData('foo-jvmId').then(res => {
        res.data.should.deepEqual(expected);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-cpu/0.0.1/jvms/foo-jvmId?sort=-timeStamp');
      httpBackend.flush();
      scope.$apply();
    });
  });

});
