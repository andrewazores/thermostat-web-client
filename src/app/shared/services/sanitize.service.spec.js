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

import { default as servicesModule, init as initServices } from 'shared/services/services.module.js';

describe('SanitizeService', () => {

  let svc;
  beforeEach(() => {
    angular.mock.module(servicesModule);
    initServices();
    angular.mock.inject(sanitizeService => {
      'ngInject';
      svc = sanitizeService;
    });
  });

  it('should exist', () => {
    should.exist(svc);
  });

  describe('non-string inputs', () => {
    it('should do nothing to undefined', () => {
      should(svc.sanitize(undefined)).be.undefined();
    });

    it('should do nothing to null', () => {
      should(svc.sanitize(null)).be.undefined();
    });

    it('should return the argument if number', () => {
      svc.sanitize(5).should.equal(5);
    });

    it('should return the argument if object', () => {
      svc.sanitize({}).should.eql({});
    });

    it('should return the argument if array', () => {
      svc.sanitize([]).should.eql([]);
    });
  });

  it('should do nothing to sane strings', () => {
    svc.sanitize('foo').should.equal('foo');
  });

  it('should sanitize string with a space', () => {
    svc.sanitize('foo bar').should.equal('foo-bar');
  });

  it('should sanitize string with multiple spaces', () => {
    svc.sanitize('foo and bar').should.equal('foo-and-bar');
  });

  it('should sanitize string with long spaces', () => {
    svc.sanitize('foo   bar').should.equal('foo-bar');
  });

});
