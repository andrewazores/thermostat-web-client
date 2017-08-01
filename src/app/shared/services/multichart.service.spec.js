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

describe('MultichartService', () => {

  let svc;
  beforeEach(() => {
    angular.mock.module(servicesModule);
    angular.mock.inject(multichartService => {
      'ngInject';
      svc = multichartService;
    });
  });

  it('should exist', () => {
    should.exist(svc);
  });

  it('should initialize an empty charts map', () => {
    svc.charts.should.be.an.instanceof(Map);
    svc.charts.should.eql(new Map());
  });

  describe('chartNames', () => {
    it('should be initially an empty array', () => {
      let res = svc.chartNames;
      res.should.be.an.Array();
      res.should.deepEqual([]);
    });

    it('should reflect added charts', () => {
      svc.addChart('foo');
      svc.addChart('bar');
      svc.chartNames.should.deepEqual(['bar', 'foo']);
    });

    it('should reflect removed charts', () => {
      svc.addChart('foo');
      svc.addChart('bar');
      svc.chartNames.should.deepEqual(['bar', 'foo']);
      svc.removeChart('foo');
      svc.chartNames.should.deepEqual(['bar']);
    });

    it('should not contain duplicates', () => {
      svc.addChart('foo');
      svc.addChart('foo');
      svc.chartNames.should.deepEqual(['foo']);
    });

    it('should be sorted alphabetically', () => {
      svc.addChart('b');
      svc.addChart('a');
      svc.addChart('d');
      svc.addChart('c');
      svc.chartNames.should.deepEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('countServicesForChart', () => {
    it('should return 0 for nonexistent chart', () => {
      svc.countServicesForChart('foo').should.equal(0);
    });

    it('should return 0 for chart with no services', () => {
      svc.addChart('foo');
      svc.countServicesForChart('foo').should.equal(0);
    });

    it('should return the service count', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addService('foo', 'foo-svc-B', angular.noop);
      svc.countServicesForChart('foo').should.equal(2);
    });

    it('should reflect removed services', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addService('foo', 'foo-svc-B', angular.noop);
      svc.countServicesForChart('foo').should.equal(2);
      svc.removeService('foo', 'foo-svc-B');
      svc.countServicesForChart('foo').should.equal(1);
    });

    it('should not count duplicate services', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.countServicesForChart('foo').should.equal(1);
    });
  });

  describe('getAxesForChart', () => {
    it('should return an empty object for nonexistent chart', () => {
      svc.getAxesForChart('foo').should.deepEqual({});
    });

    it('should return a single-axis config for a chart with one service', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.getAxesForChart('foo').should.deepEqual({'foo-svc-A': 'y'});
    });

    it('should return a two-axis config for a chart with two services', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addService('foo', 'foo-svc-B', angular.noop);
      svc.getAxesForChart('foo').should.deepEqual(
        {
          'foo-svc-A': 'y',
          'foo-svc-B': 'y2'
        }
      );
    });

    it('should return a two-axis config for a chart with three services', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addService('foo', 'foo-svc-B', angular.noop);
      svc.addService('foo', 'foo-svc-C', angular.noop);
      svc.getAxesForChart('foo').should.deepEqual(
        {
          'foo-svc-A': 'y',
          'foo-svc-B': 'y2',
          'foo-svc-C': 'y2'
        }
      );
    });
  });

  describe('addChart', () => {
    it('should add new charts', () => {
      svc.hasChart('foo').should.be.false();
      svc.addChart('foo');
      svc.hasChart('foo').should.be.true();
    });

    it('should not add duplicates', () => {
      svc.addChart('foo');
      svc.addChart('foo');
      let map = new Map();
      map.set('foo', new Array());
      svc.charts.should.eql(map);
      svc.hasChart('foo').should.be.true();
    });

    it('should not clobber services for repeat additions', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.addChart('foo');
      let map = new Map();
      map.set('foo', [{svcName: 'foo-svc-A', getFn: angular.noop}]);
      svc.charts.should.eql(map);
    });
  });

  describe('removeChart', () => {
    it('should do nothing for nonexistent charts', () => {
      svc.hasChart('foo').should.be.false();
      svc.removeChart('foo');
      svc.hasChart('foo').should.be.false();
      svc.charts.should.deepEqual(new Map());
    });

    it('should remove added charts', () => {
      svc.addChart('foo');
      svc.hasChart('foo').should.be.true();
      svc.removeChart('foo');
      svc.hasChart('foo').should.be.false();
    });
  });

  describe('addService', () => {
    it('should do nothing for nonexistent chart', () => {
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.addService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.countServicesForChart('foo').should.equal(0);
    });

    it('should add service to chart', () => {
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.true();
      svc.countServicesForChart('foo').should.equal(1);
    });

    it('should do nothing if service already added', () => {
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.true();
      svc.addService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.true();
      svc.countServicesForChart('foo').should.equal(1);
    });
  });

  describe('hasServiceForChart', () => {
    it('should return false for nonexistent chart', () => {
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
    });

    it('should return false for nonexistent service', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-B');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
    });

    it('should return true for existing service', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.true();
    });
  });

  describe('removeService', () => {
    it('should do nothing for nonexistent chart', () => {
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.hasChart('foo').should.be.false();
      svc.removeService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.hasChart('foo').should.be.false();
    });

    it('should do nothing for nonexistent service', () => {
      svc.addChart('foo');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.hasChart('foo').should.be.true();
      svc.removeService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
      svc.hasChart('foo').should.be.true();
    });

    it('should remove services', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', angular.noop);
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.true();
      svc.removeService('foo', 'foo-svc-A');
      svc.hasServiceForChart('foo', 'foo-svc-A').should.be.false();
    });
  });

  describe('getData', () => {
    it('should reject for nonexistent chart', () => {
      return svc.getData('foo').should.be.rejectedWith(Error);
    });

    it('should resolve data from single service getter functions', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', () => new Promise(resolve => resolve(500)));
      return svc.getData('foo').should.be.fulfilledWith({ yData: ['foo-svc-A', 500] });
    });

    it('should resolve data from multiple service getter functions', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', () => new Promise(resolve => resolve(500)));
      svc.addService('foo', 'foo-svc-B', () => new Promise(resolve => resolve(600)));
      svc.addService('foo', 'foo-svc-C', () => new Promise(resolve => resolve(700)));
      svc.addChart('bar');
      svc.addService('bar', 'bar-svc-A', () => new Promise(resolve => resolve(500)));
      return svc.getData('foo').should.be.fulfilledWith({
        yData: ['foo-svc-A', 500],
        yData1: ['foo-svc-B', 600],
        yData2: ['foo-svc-C', 700]
      });
    });
  });

  describe('rename', () => {
    it('should rename existing charts', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc-A', () => new Promise(resolve => resolve(100)));

      svc.rename('foo', 'bar');

      svc.hasChart('foo').should.be.false();
      svc.hasChart('bar').should.be.true();

      svc.hasServiceForChart('bar', 'foo-svc-A').should.be.true();
      return svc.getData('bar').should.be.fulfilledWith({
        yData: [ 'foo-svc-A', 100 ]
      });
    });

    it('should do nothing if chart does not already exist', () => {
      svc.rename('foo', 'bar');
      svc.hasChart('foo').should.be.false();
      svc.hasChart('bar').should.be.false();
    });

    it('should do nothing if rename would overwrite', () => {
      svc.addChart('foo');
      svc.addService('foo', 'foo-svc', angular.noop);

      svc.addChart('bar');
      svc.addService('bar', 'bar-svc', angular.noop);

      svc.rename('foo', 'bar');
      svc.hasChart('foo').should.be.true();
      svc.hasChart('bar').should.be.true();
      svc.countServicesForChart('foo').should.equal(1);
      svc.countServicesForChart('bar').should.equal(1);
    });
  });

});
