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

describe('SystemInfoService', () => {

  beforeEach(angular.mock.module($provide => {
    'ngInject';
    $provide.value('gatewayUrl', 'http://example.com:1234');
  }));

  beforeEach(angular.mock.module('systemInfo.service'));

  let httpBackend, scope, svc;
  beforeEach(inject(($httpBackend, $rootScope, systemInfoService) => {
    'ngInject';
    httpBackend = $httpBackend;

    scope = $rootScope;
    svc = systemInfoService;
  }));

  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('getSystemInfo(systemId)', () => {
    it('should resolve mock data', done => {
      let expected = {
        osName: 'Linux',
        osKernel: '4.10.11-200.fc25.x86_64'
      };
      httpBackend.when('GET', 'http://example.com:1234/system-info/foo-systemId')
        .respond(expected);
      svc.getSystemInfo('foo-systemId').then(res => {
        res.data.should.deepEqual(expected);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/system-info/foo-systemId');
      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('getCpuInfo(systemId)', () => {
    it('should resolve mock data', done => {
      let expected = {
        percent: 80
      };
      httpBackend.when('GET', 'http://example.com:1234/system-info/cpu/foo-systemId')
        .respond(expected);
      svc.getCpuInfo('foo-systemId').then(res => {
        res.data.should.deepEqual(expected);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/system-info/cpu/foo-systemId');
      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('getMemoryInfo(systemId)', () => {
    it('should resolve mock data', done => {
      let expected = {
        total: 16384,
        used: 9001
      };
      httpBackend.when('GET', 'http://example.com:1234/system-info/memory/foo-systemId')
        .respond(expected);
      svc.getMemoryInfo('foo-systemId').then(res => {
        res.data.should.deepEqual(expected);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/system-info/memory/foo-systemId');
      httpBackend.flush();
      scope.$apply();
    });
  });

});
