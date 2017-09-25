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

import serviceModule from './byteman.service.js';
import servicesModule from 'shared/services/services.module.js';

describe('BytemanService', () => {

  let cmdChan;
  beforeEach(() => {
    angular.mock.module('configModule', $provide => {
      'ngInject';
      $provide.constant('gatewayUrl', 'http://example.com:1234');
    });

    cmdChan = {
      sendMessage: sinon.stub().returns({
        then: sinon.stub().yields({
          payload: {
            respType: {
              value: 'OK'
            }
          }
        })
      }),
      sequence: 5,
      responseCodes: {
        OK: {
          value: 'OK'
        }
      }
    };
    angular.mock.module(servicesModule, $provide => {
      'ngInject';
      $provide.constant('commandChannelService', cmdChan);
    });

    angular.mock.module(serviceModule);
  });

  let httpBackend, scope, svc;
  beforeEach(inject(($httpBackend, $rootScope, bytemanService) => {
    'ngInject';
    httpBackend = $httpBackend;

    scope = $rootScope;
    svc = bytemanService;
  }));

  afterEach(() => {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('getLoadedRules (jvmId)', () => {
    it('should resolve mock data', done => {
      let response = {
        response: [
          {
            rule: 'loaded rule'
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId')
        .respond(response);
      svc.getLoadedRules('foo-jvmId').then(res => {
        res.should.equal(response.response[0].rule);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId');
      httpBackend.flush();
      scope.$apply();
    });

    it('should return empty string if no results', done => {
      let response = {
        response: []
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId')
        .respond(response);
      svc.getLoadedRules('foo-jvmId').then(res => {
        res.should.equal('');
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId');
      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('loadRule (systemId, jvmId, rule)', () => {
    it('should send rule in command channel request payload', done => {
      let jvmInfo = {
        response: [
          {
            agentId: 'foo-agentId',
            jvmPid: 100,
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId')
        .respond(jvmInfo);
      httpBackend.expectGET('http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId');

      let bytemanStatus = {
        response: [
          {
            listenPort: 9999
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId')
        .respond(bytemanStatus);
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId');

      svc.loadRule('foo-systemId', 'foo-jvmId', 'fake rule').then(res => {
        cmdChan.sendMessage.should.be.calledOnce();
        cmdChan.sendMessage.should.be.calledWith(
          'commands/v1/actions/byteman/systems/foo-systemId/agents/foo-agentId/jvms/foo-jvmId/sequence/5',
          {
            'byteman-action': 0,
            'byteman-rule': 'fake rule',
            'listen-port': 9999,
            'vm-pid': 100
          }
        );
        res.should.deepEqual({ status: true, reason: undefined });
        done();
      });

      httpBackend.flush();
      scope.$apply();
    });

    it('should use listenPort:-1 if none in storage', done => {
      let jvmInfo = {
        response: [
          {
            agentId: 'foo-agentId',
            jvmPid: 100,
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId')
        .respond(jvmInfo);
      httpBackend.expectGET('http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId');

      let bytemanStatus = {
        response: []
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId')
        .respond(bytemanStatus);
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId');

      svc.loadRule('foo-systemId', 'foo-jvmId', 'fake rule').then(res => {
        cmdChan.sendMessage.should.be.calledOnce();
        cmdChan.sendMessage.should.be.calledWith(
          'commands/v1/actions/byteman/systems/foo-systemId/agents/foo-agentId/jvms/foo-jvmId/sequence/5',
          {
            'byteman-action': 0,
            'byteman-rule': 'fake rule',
            'listen-port': -1,
            'vm-pid': 100
          }
        );
        res.should.deepEqual({ status: true, reason: undefined });
        done();
      });

      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('unloadRules (systemId, jvmId)', () => {
    it('should send unload rules request on command channel', done => {
      let jvmInfo = {
        response: [
          {
            agentId: 'foo-agentId',
            jvmPid: 100,
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId')
        .respond(jvmInfo);
      httpBackend.expectGET('http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId');

      let bytemanStatus = {
        response: [
          {
            listenPort: 9999
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId')
        .respond(bytemanStatus);
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/status/jvms/foo-jvmId');

      svc.unloadRules('foo-systemId', 'foo-jvmId').then(res => {
        cmdChan.sendMessage.should.be.calledOnce();
        cmdChan.sendMessage.should.be.calledWith(
          'commands/v1/actions/byteman/systems/foo-systemId/agents/foo-agentId/jvms/foo-jvmId/sequence/5',
          {
            'byteman-action': 1,
            'listen-port': 9999,
            'vm-pid': 100
          }
        );
        res.should.deepEqual({ status: true, reason: undefined });
        done();
      });

      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('getJvmMainClass (systemId, jvmId)', () => {
    it('should resolve mock data', done => {
      let response = {
        response: [
          {
            mainClass: 'com.example.FooClass'
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId')
        .respond(response);
      svc.getJvmMainClass('foo-systemId', 'foo-jvmId').then(res => {
        res.should.equal(response.response[0].mainClass);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvms/0.0.1/systems/foo-systemId/jvms/foo-jvmId');
      httpBackend.flush();
      scope.$apply();
    });
  });

  describe('getMetrics (jvmId, oldestLimit)', () => {
    it('should resolve mock data when payload is a string type', done => {
      let response = {
        response: [
          {
            timeStamp: { $numberLong: '5000' },
            marker: 'foo-marker',
            payload: '{"action":"foo-method called"}'
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/metrics/jvms/foo-systemId?limit=0&query=timeStamp%3E%3D6789&sort=-timeStamp')
        .respond(response);
      svc.getMetrics('foo-systemId', 6789).then(res => {
        res.should.deepEqual([{
          timestamp: { $numberLong: '5000' },
          marker: 'foo-marker',
          name: 'action',
          value: 'foo-method called'
        }]);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/metrics/jvms/foo-systemId?limit=0&query=timeStamp%3E%3D6789&sort=-timeStamp');
      httpBackend.flush();
      scope.$apply();
    });

    it('should resolve mock data when payload is a non-string type', done => {
      let response = {
        response: [
          {
            timeStamp: { $numberLong: '5000' },
            marker: 'foo-marker',
            payload: { doubleKey: 0.125 }
          }
        ]
      };
      httpBackend.when('GET', 'http://example.com:1234/jvm-byteman/0.0.1/metrics/jvms/foo-systemId?limit=0&query=timeStamp%3E%3D6789&sort=-timeStamp')
        .respond(response);
      svc.getMetrics('foo-systemId', 6789).then(res => {
        res.should.deepEqual([{
          timestamp: { $numberLong: '5000' },
          marker: 'foo-marker',
          name: 'doubleKey',
          value: 0.125
        }]);
        done();
      });
      httpBackend.expectGET('http://example.com:1234/jvm-byteman/0.0.1/metrics/jvms/foo-systemId?limit=0&query=timeStamp%3E%3D6789&sort=-timeStamp');
      httpBackend.flush();
      scope.$apply();
    });
  });

});

