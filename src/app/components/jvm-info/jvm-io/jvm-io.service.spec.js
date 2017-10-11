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

describe('JvmIoService', () => {

  beforeEach(() => {
    angular.mock.module('configModule', $provide => {
      'ngInject';
      $provide.constant('gatewayUrl', 'http://example.com:1234');
    });

    angular.mock.module('jvmIo.service');
  });

  let httpBackend, scope, svc;
  beforeEach(inject(($httpBackend, $rootScope, jvmIoService) => {
    'ngInject';
    httpBackend = $httpBackend;

    scope = $rootScope;
    svc = jvmIoService;
  }));

  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('getJvmIoData (jvmId, since)', () => {
    it('should resolve mock data', done => {
      let expected = {
        response: [
          {
            timeStamp: { $numberLong: (Date.now() - 10000).toString() },
            charactersRead: { $numberLong: '100000' },
            charactersWritten: { $numberLong: '50000' },
            readSysCalls: { $numberLong: '100' },
            writeSysCalls: { $numberLong: '50' }
          },
          {
            timeStamp: { $numberLong: Date.now().toString() },
            charactersRead: { $numberLong: '200000' },
            charactersWritten: { $numberLong: '60000' },
            readSysCalls: { $numberLong: '200' },
            writeSysCalls: { $numberLong: '60' }
          },
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-io/0.0.1/jvms/foo-jvmId?limit=0&query=timeStamp%3E%3D150000&sort=%2BtimeStamp')
        .respond(expected);
      svc.getJvmIoData('foo-jvmId', 150000).then(res => {
        res.should.deepEqual(expected.response);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-io/0.0.1/jvms/foo-jvmId?limit=0&query=timeStamp%3E%3D150000&sort=%2BtimeStamp');
      httpBackend.flush();
      scope.$apply();
    });
  });

});
