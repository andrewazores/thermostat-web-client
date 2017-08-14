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
import configModule from 'shared/config/config.module.js';

describe('CommandChannelService', () => {

  let svc, scope, webSocketFactory, translate;
  beforeEach(() => {
    let addEventListener = sinon.spy();
    let removeEventListener = sinon.spy();
    let send = sinon.spy();
    let close = sinon.spy();
    webSocketFactory = {
      addEventListener: addEventListener,
      removeEventListener: removeEventListener,
      send: send,
      close: close,
      createSocket: sinon.stub().returns({
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        send: send,
        close: close
      })
    };
    let translateThen = sinon.stub().yields({
      'services.commandChannel.responseCodes.OK': 'Request succeeded',
      'services.commandChannel.responseCodes.ERROR': 'Request failed for unknown reason',
      'services.commandChannel.responseCodes.AUTH_FAIL': 'Request failed for authentication or authorization reasons',
      'services.commandChannel.responseCodes.UNKNOWN': 'Request failed with unknown response type'
    });
    translate = sinon.stub().returns({
      then: translateThen
    });
    translate.then = translateThen;
    angular.mock.module(configModule, $provide => {
      'ngInject';
      $provide.constant('commandChannelUrl', 'ws://foo-host:1234');
    });
    angular.mock.module(servicesModule);
    angular.mock.module($provide => {
      'ngInject';
      $provide.value('webSocketFactory', webSocketFactory);
      $provide.value('$translate', translate);
    });
    angular.mock.inject(($rootScope, commandChannelService) => {
      'ngInject';
      scope = $rootScope;
      svc = commandChannelService;
      svc.setCredentials('', '');
    });
  });

  it('should exist', () => {
    should.exist(svc);
  });

  it('should increment sequence number on access', () => {
    let seqA = svc.sequence;
    let seqB = svc.sequence;
    seqA.should.be.a.Number();
    seqB.should.be.a.Number();
    seqB.should.equal(seqA + 1);
  });

  it('should wrap sequence numbers back to 1', () => {
    svc._sequence = Number.MAX_SAFE_INTEGER - 1;
    svc.sequence.should.equal(Number.MAX_SAFE_INTEGER - 1);
    svc.sequence.should.equal(Number.MAX_SAFE_INTEGER);
    svc.sequence.should.equal(1);
  });

  describe('sendMessage', () => {
    it('should connect to correct command channel URL', () => {
      svc.sendMessage('foo', 'bar');
      webSocketFactory.createSocket.should.be.calledWith('ws://foo-host:1234/foo');
      scope.$apply();
    });

    it('$translate, should reject if browser does not support WebSockets', done => {
      webSocketFactory.createSocket.returns(null);
      svc.sendMessage('foo', 'bar').catch(() => done());
      scope.$apply();
    });

    it('should send message when socket is ready', () => {
      svc.sendMessage('foo');
      webSocketFactory.addEventListener.should.be.calledWith('open', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('open').args[0][1]();
      webSocketFactory.send.should.be.calledOnce();
      webSocketFactory.send.should.be.calledWith(JSON.stringify({
        type: 2,
        payload: {}
      }));
    });

    it('should resolve with socket response respType replaced', done => {
      svc.sendMessage('foo', 'bar').then(v => {
        v.should.deepEqual({ payload: { respType: { value: 'OK', message: 'Request succeeded' } } });
        done();
      });
      webSocketFactory.addEventListener.should.be.calledWith('message', sinon.match.func);
      webSocketFactory.removeEventListener.should.not.be.called();
      let onmessage = webSocketFactory.addEventListener.withArgs('message').args[0][1];
      onmessage({ data: JSON.stringify({ payload: { respType: 'OK' }}) });
      webSocketFactory.close.should.be.calledOnce();
      webSocketFactory.removeEventListener.should.be.calledWith('close');
      scope.$apply();
    });

    it('should resolve with socket response respType replaced when respType is not recognized', done => {
      svc.sendMessage('foo', 'bar').then(v => {
        v.should.deepEqual({ payload: { respType: { value: 'UNKNOWN', message: 'Request failed with unknown response type' } } });
        done();
      });
      webSocketFactory.addEventListener.should.be.calledWith('message', sinon.match.func);
      webSocketFactory.removeEventListener.should.not.be.called();
      let onmessage = webSocketFactory.addEventListener.withArgs('message').args[0][1];
      onmessage({ data: JSON.stringify({ payload: { respType: 'FOO_RESPONSE' }}) });
      webSocketFactory.close.should.be.calledOnce();
      webSocketFactory.removeEventListener.should.be.calledWith('close');
      scope.$apply();
    });

    it('should reject on error', done => {
      svc.sendMessage('foo', 'bar').catch(v => {
        v.should.containEql('fooError');
        done();
      });
      webSocketFactory.addEventListener.should.be.calledWith('error', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('error').args[0][1]('fooError');
      webSocketFactory.close.should.be.calledOnce();
      scope.$apply();
    });

    it('should reject if socket closes before response message received', done => {
      svc.sendMessage('foo', 'bar').catch(v => {
        v.should.equal('fakeReason');
        done();
      });
      webSocketFactory.addEventListener.should.be.calledWith('close', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('close').args[0][1]({ reason: 'fakeReason' });
      scope.$apply();
    });

    it('should reject with default message if socket closes before response message received', done => {
      svc.sendMessage('foo', 'bar').catch(v => {
        v.should.equal('No response received');
        done();
      });
      translate.then.yields('No response received');
      webSocketFactory.addEventListener.should.be.calledWith('close', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('close').args[0][1]({});
      scope.$apply();
    });

  });

  describe('auth credentials', () => {
    it('should connect to websocket with basic auth credentials', () => {
      svc.setCredentials('fooUser', 'fooPass');
      svc.sendMessage('foo', 'bar');
      webSocketFactory.createSocket.should.be.calledWith('ws://fooUser:fooPass@foo-host:1234/foo');
    });

    it('should connect to websocket with basic auth credentials and empty password', () => {
      svc.setCredentials('fooUser', '');
      svc.sendMessage('foo', 'bar');
      webSocketFactory.createSocket.should.be.calledWith('ws://fooUser@foo-host:1234/foo');
    });
  });

  describe('responseCodes', () => {
    it('should enumerate the expected response types', () => {
      svc.responseCodes.should.have.size(4);

      svc.responseCodes.should.have.ownProperty('OK');
      svc.responseCodes.OK.value.should.equal('OK');
      svc.responseCodes.OK.message.should.not.equal('');

      svc.responseCodes.should.have.ownProperty('ERROR');
      svc.responseCodes.ERROR.value.should.equal('ERROR');
      svc.responseCodes.ERROR.message.should.not.equal('');

      svc.responseCodes.should.have.ownProperty('AUTH_FAIL');
      svc.responseCodes.AUTH_FAIL.value.should.equal('AUTH_FAIL');
      svc.responseCodes.AUTH_FAIL.message.should.not.equal('');

      svc.responseCodes.should.have.ownProperty('UNKNOWN');
      svc.responseCodes.UNKNOWN.value.should.equal('UNKNOWN');
      svc.responseCodes.UNKNOWN.message.should.not.equal('');
    });

    it('should be read-only', () => {
      should.throws(() => {
        svc.responseCodes = [];
      }, 'property should not be assignable');

      should.throws(() => {
        svc.responseCodes.ADDED = {
          value: 'ADDED',
          message: 'Added a new response code'
        };
      }, 'property should be immutable');

      should.throws(() => {
        svc.responseCodes.OK.value = 'NOK';
      }, 'values should be immutable');
    });
  });

});
