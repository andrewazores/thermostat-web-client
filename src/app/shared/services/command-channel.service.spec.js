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

  let svc, scope, webSocketFactory;
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
    angular.mock.module(configModule, $provide => {
      'ngInject';
      $provide.constant('commandChannelUrl', 'ws://foo-host:1234');
    });
    angular.mock.module(servicesModule);
    angular.mock.module($provide => {
      'ngInject';
      $provide.value('webSocketFactory', webSocketFactory);
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

    it('should reject if browser does not support WebSockets', done => {
      webSocketFactory.createSocket.returns(null);
      svc.sendMessage('foo', 'bar').catch(() => done());
      scope.$apply();
    });

    it('should send message when socket is ready', () => {
      svc.sendMessage('foo', 'bar');
      webSocketFactory.addEventListener.should.be.calledWith('open', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('open').args[0][1]();
      webSocketFactory.send.should.be.calledOnce();
      webSocketFactory.send.should.be.calledWith(JSON.stringify({
        type: 2,
        payload: { receiver: 'bar' }
      }));
    });

    it('should resolve with socket response', done => {
      svc.sendMessage('foo', 'bar').then(v => {
        v.should.deepEqual({ payload: 'fooMessage' });
        done();
      });
      webSocketFactory.addEventListener.should.be.calledWith('message', sinon.match.func);
      webSocketFactory.removeEventListener.should.not.be.called();
      let onmessage = webSocketFactory.addEventListener.withArgs('message').args[0][1];
      onmessage({ data: JSON.stringify({ payload: 'fooMessage' }) });
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
      webSocketFactory.addEventListener.should.be.calledWith('close', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('close').args[0][1]({});
      scope.$apply();
    });

    it('should append receiver to payload if specified', () => {
      svc.sendMessage('foo', 'bar', { prop: 5 });
      webSocketFactory.addEventListener.should.be.calledWith('open', sinon.match.func);
      webSocketFactory.addEventListener.withArgs('open').args[0][1]();
      webSocketFactory.send.should.be.calledOnce();
      webSocketFactory.send.should.be.calledWith(JSON.stringify({
        type: 2,
        payload: {
          prop: 5,
          receiver: 'bar'
        }
      }));
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

});
