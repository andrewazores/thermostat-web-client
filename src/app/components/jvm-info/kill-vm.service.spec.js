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

import servicesModule from 'shared/services/services.module.js';

describe('KillVmService', () => {

  let svc, scope, commandChannel;
  beforeEach(() => {
    commandChannel = {};
    angular.mock.module(servicesModule, $provide => {
      'ngInject';
      $provide.value('commandChannelService', commandChannel);
    });
    angular.mock.inject((killVmService, $rootScope, $q) => {
      'ngInject';
      scope = $rootScope;
      let promise = $q.defer();
      commandChannel.promise = promise;
      commandChannel.sendMessage = sinon.stub().returns(promise.promise);
      commandChannel.sequence = 444;
      svc = killVmService;
    });
  });

  it('should exist', () => {
    should.exist(svc);
  });

  it('should include sequence number in request URL', () => {
    svc.getPath('foo', 'bar', 'baz').should.containEql('sequence/444');
  });

  describe('CommandChannel delegation', () => {
    it('should delegate', () => {
      svc.killVm('foo', 'bar', 'baz');
      commandChannel.sendMessage.should.be.calledWith(sinon.match(svc.getPath('foo', 'bar', 'baz')),
        'com.redhat.thermostat.killvm.agent.internal.KillVmReceiver');
      scope.$apply();
    });

    it('should resolve true on command channel success', done => {
      svc.killVm('foo').then(success => {
        success.should.be.true();
        done();
      });
      commandChannel.promise.resolve({
        type: 100,
        sequence: 1,
        payload: {
          respType: 'OK'
        }
      });
      scope.$apply();
    });

    it('should resolve false on command channel response error', done => {
      svc.killVm('foo', 'bar', 'baz').then(success => {
        success.should.be.false();
        done();
      });
      commandChannel.promise.resolve({
        type: 100,
        sequence: 1,
        payload: {
          respType: 'ERROR'
        }
      });
      scope.$apply();
    });

    it('should reject false on command channel request error', done => {
      svc.killVm('foo', 'bar', 'baz').catch(failure => {
        failure.should.equal('fooFailure');
        done();
      });
      commandChannel.promise.reject('fooFailure');
      scope.$apply();
    });
  });

});
