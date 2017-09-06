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

describe('localStorage', () => {

  let svc, mockStorage;
  beforeEach(() => {
    angular.mock.module($provide => {
      'ngInject';
      mockStorage = {
        setItem: sinon.spy(),
        getItem: sinon.stub(),
        removeItem: sinon.spy(),
        hasItem: sinon.stub(),
        clear: sinon.spy()
      };
      let wdw = {
        localStorage: mockStorage
      };
      $provide.value('$window', wdw);
    });

    angular.mock.module(servicesModule);

    angular.mock.inject(localStorage => {
      'ngInject';
      svc = localStorage;
    });
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('setItem', () => {
    it('should delegate', () => {
      mockStorage.setItem.should.not.be.called();
      svc.setItem('foo', 'bar');
      mockStorage.setItem.should.be.calledOnce();
      mockStorage.setItem.should.be.calledWith('foo', 'bar');
    });
  });

  describe('getItem', () => {
    it('should delegate', () => {
      mockStorage.getItem.should.not.be.called();
      mockStorage.getItem.returns('getItemMock');
      svc.getItem('foo').should.equal('getItemMock');
      mockStorage.getItem.should.be.calledOnce();
      mockStorage.getItem.should.be.calledWith('foo');
    });
  });

  describe('removeItem', () => {
    it('should delegate', () => {
      mockStorage.removeItem.should.not.be.called();
      svc.removeItem('foo');
      mockStorage.removeItem.should.be.calledOnce();
      mockStorage.removeItem.should.be.calledWith('foo');
    });
  });

  describe('hasItem', () => {
    it('should return false on undefined', () => {
      mockStorage.getItem.withArgs('foo').returns(undefined);
      svc.hasItem('foo').should.equal(false);
    });

    it('should return false on null', () => {
      mockStorage.getItem.withArgs('foo').returns(null);
      svc.hasItem('foo').should.equal(false);
    });

    it('should return true on other', () => {
      mockStorage.getItem.withArgs('foo').returns(5);
      svc.hasItem('foo').should.equal(true);
    });
  });

  describe('clear', () => {
    it('should delegate', () => {
      mockStorage.clear.should.not.be.called();
      svc.clear();
      mockStorage.clear.should.be.calledOnce();
    });
  });

});
