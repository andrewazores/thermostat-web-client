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

describe('ScaleBytesService', () => {

  beforeEach(angular.mock.module('app.services'));

  let svc;
  beforeEach(angular.mock.inject(scaleBytesService => {
    'ngInject';
    svc = scaleBytesService;
  }));

  it('should exist', () => {
    should.exist(svc);
  });

  it('should not scale 0 bytes', () => {
    svc.format({ $numberLong: '0' }).should.deepEqual({
      result: 0,
      scale: 1,
      unit: 'B'
    });
  });

  it('should not scale 100 bytes', () => {
    svc.format({ $numberLong: '100' }).should.deepEqual({
      result: 100,
      scale: 1,
      unit: 'B'
    });
  });

  it('should not scale 1023 bytes', () => {
    svc.format({ $numberLong: '1023' }).should.deepEqual({
      result: 1023,
      scale: 1,
      unit: 'B'
    });
  });

  it('should scale 1024 bytes', () => {
    svc.format({ $numberLong: '1024' }).should.deepEqual({
      result: 1,
      scale: 1024,
      unit: 'KiB'
    });
  });

  it('should scale 2560 bytes', () => {
    svc.format({ $numberLong: '2560' }).should.deepEqual({
      result: 2.5,
      scale: 1024,
      unit: 'KiB'
    });
  });

  it('should scale 2860 bytes', () => {
    svc.format({ $numberLong: '2860' }).should.deepEqual({
      result: 2.79,
      scale: 1024,
      unit: 'KiB'
    });
  });

  it('should round 2860 bytes up when dp=0', () => {
    svc.format({ $numberLong: '2860' }, 0).should.deepEqual({
      result: 3,
      scale: 1024,
      unit: 'KiB'
    });
  });

  it('should round 2500 bytes down when dp=0', () => {
    svc.format({ $numberLong: '2500' }, 0).should.deepEqual({
      result: 2,
      scale: 1024,
      unit: 'KiB'
    });
  });

  it('should scale 1024 * 1024 bytes', () => {
    svc.format({ $numberLong: (1024 * 1024).toString() }).should.deepEqual({
      result: 1,
      scale: 1024 * 1024,
      unit: 'MiB'
    });
  });

});
