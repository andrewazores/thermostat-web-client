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

import * as decorator from './gateway-decorator.service.js';

describe('gatewayDecoratorService', () => {

  let provide, userPrefsService;
  beforeEach(() => {
    provide = { decorator: sinon.spy() };
    userPrefsService = { tlsEnabled: true };
  });

  describe('gatewayUrl', () => {
    it('should provide a gatewayUrl decorator function', () => {
      provide.decorator.should.not.be.called();
      decorator.gatewayUrl(provide);
      provide.decorator.should.be.calledOnce();
      provide.decorator.should.be.calledWith('gatewayUrl', decorator.gatewayUrlDecorator);
    });
  });

  describe('gatewayUrlDecorator', () => {
    it('should enforce https when TLS is enabled', () => {
      decorator.gatewayUrlDecorator('http://example.com/', userPrefsService).should.equal('https://example.com/');
    });

    it('should enforce http when TLS is disabled', () => {
      userPrefsService.tlsEnabled = false;
      decorator.gatewayUrlDecorator('https://example.com/', userPrefsService).should.equal('http://example.com/');
    });

    it('should not change protocol if already matching', () => {
      userPrefsService.tlsEnabled = false;
      decorator.gatewayUrlDecorator('http://example.com/', userPrefsService).should.equal('http://example.com/');
    });
  });

  describe('commandChannelUrl', () => {
    it('should provide a commandChannelUrl decorator function', () => {
      provide.decorator.should.not.be.called();
      decorator.commandChannelUrl(provide);
      provide.decorator.should.be.calledOnce();
      provide.decorator.should.be.calledWith('commandChannelUrl', decorator.commandChannelUrlDecorator);
    });
  });

  describe('commandChannelUrlDecorator', () => {
    it('should enforce wss when TLS is enabled', () => {
      decorator.commandChannelUrlDecorator('ws://example.com/', userPrefsService).should.equal('wss://example.com/');
    });

    it('should enforce ws when TLS is disabled', () => {
      userPrefsService.tlsEnabled = false;
      decorator.commandChannelUrlDecorator('wss://example.com/', userPrefsService).should.equal('ws://example.com/');
    });

    it('should not change protocol if already matching', () => {
      userPrefsService.tlsEnabled = false;
      decorator.commandChannelUrlDecorator('ws://example.com/', userPrefsService).should.equal('ws://example.com/');
    });
  });

});
