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

describe('JvmGcController', () => {

  beforeEach(angular.mock.module('app.filters'));
  beforeEach(angular.mock.module('jvmGc.controller'));

  let scope, interval, dateFilterStub, dateFormatSpy, svc, promise, ctrl;
  beforeEach(inject(($controller) => {
    'ngInject';

    dateFilterStub = sinon.stub().returns('mockDate');
    dateFormatSpy = {
      time: {
        medium: sinon.spy()
      }
    };

    scope = {
      $on: sinon.spy(),
      $watch: sinon.spy()
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.spy();

    promise = {
      then: sinon.spy()
    };
    svc = {
      getJvmGcData: sinon.stub().returns(promise)
    };

    ctrl = $controller('JvmGcController', {
      jvmId: 'foo-jvmId',
      $scope: scope,
      $interval: interval,
      dateFilter: dateFilterStub,
      DATE_FORMAT: dateFormatSpy,
      jvmGcService: svc
    });
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should update on init', () => {
    svc.getJvmGcData.should.be.calledWith('foo-jvmId', 30);
  });

  it('should call to service on update', () => {
    svc.getJvmGcData.should.be.calledOnce();
    promise.then.should.be.calledOnce();
    ctrl.update();
    svc.getJvmGcData.should.be.calledTwice();
    promise.then.should.be.calledTwice();

    promise.then.secondCall.should.be.calledWith(sinon.match.func, sinon.match.func);
    ctrl.collectors.should.deepEqual([]);
    let successHandler = promise.then.args[1][0];
    successHandler({
      data: {
        response: [
          {
            collectorName: 'fooCollector',
            timeStamp: { $numberLong: '100' },
            wallTimeInMicros: { $numberLong: '50' }
          }
        ]
      }
    });
    ctrl.collectors.should.deepEqual(['fooCollector']);

    let errorHandler = promise.then.args[1][1];
    errorHandler.should.equal(angular.noop);
    errorHandler();
  });

  it('should reset interval on refreshRate change', () => {
    ctrl.should.not.have.ownProperty('refresh');
    ctrl.setRefreshRate(1);
    interval.should.be.calledWith(sinon.match.func, sinon.match(1));
    ctrl.should.have.ownProperty('refresh');
    ctrl.refresh.should.equal('interval-sentinel');
  });

  it('should trim data on dataAgeLimit change', () => {
    scope.$watch.should.be.calledWith('dataAgeLimit');
    scope.$watch.args[1][0].should.equal('dataAgeLimit');
    let fn = scope.$watch.args[1][1];
    fn.should.be.a.Function();
  });

  it('should trim old data', () => {
    let oldSample = {
      micros: 100,
      timestamp: 1
    };

    let futureSample = {
      micros: 200,
      timestamp: Date.now() + 600000
    };

    ctrl.collectorData.set('fooCollector', [oldSample, futureSample]);
    scope.$watch.args[1][1]();

    let expected = new Map();
    expected.set('fooCollector', [futureSample]);

    ctrl.collectorData.should.deepEqual(expected);
  });

  it('should set interval on start', () => {
    interval.should.not.be.called();
    interval.cancel.should.not.be.called();

    ctrl.start();

    interval.cancel.should.not.be.called();
    interval.should.be.calledWith(sinon.match.func, '1000');
  });

  it('should disable when setRefreshRate is called with a non-positive value', () => {
    interval.cancel.should.not.be.called();
    ctrl.setRefreshRate.should.not.be.called();
    ctrl.update.should.not.be.called();

    ctrl.setRefreshRate(1);

    interval.cancel.should.not.be.called();
    ctrl.should.have.ownProperty('refresh');

    ctrl.setRefreshRate(-1);

    interval.cancel.should.be.calledOnce();
    ctrl.should.not.have.ownProperty('refresh');
  });

  it('should call controller#update() on refresh', () => {
    scope.$watch.should.be.calledWith(sinon.match('refreshRate'), sinon.match.func);
    let f = scope.$watch.args[0][1];
    f(1);
    let func = interval.args[0][0];
    let callCount = svc.getJvmGcData.callCount;
    func();
    svc.getJvmGcData.callCount.should.equal(callCount + 1);
  });

  describe('makeConfig', () => {
    let cfg;
    beforeEach(() => {
      ctrl.makeConfig('fooCollector');
      cfg = ctrl.chartConfigs.fooCollector;
    });

    it('should cache', () => {
      ctrl.collectors.should.deepEqual(['fooCollector']);
      ctrl.makeConfig('fooCollector');
      ctrl.collectors.should.deepEqual(['fooCollector']);
    });

    it('should sort', () => {
      ctrl.makeConfig('gooCollector');
      ctrl.makeConfig('booCollector');
      ctrl.collectors.should.deepEqual(['booCollector', 'fooCollector', 'gooCollector']);
    });

    it('should set chartId', () => {
      cfg.chartId.should.equal('chart-fooCollector');
    });

    it('should use dateFilter with DATE_FORMAT.time.medium to format x ticks', () => {
      let fn = cfg.axis.x.tick.format;
      fn.should.be.a.Function();
      fn('fooTimestamp').should.equal('mockDate');
      dateFilterStub.should.be.calledWith('fooTimestamp', dateFormatSpy.time.medium);
    });

    it('should format y ticks directly', () => {
      let fn = cfg.axis.y.tick.format;
      fn.should.be.a.Function();
      fn(100).should.equal(100);
    });

    it('should set tooltip', () => {
      let fmt = cfg.tooltip.format;
      fmt.should.have.ownProperty('title');
      fmt.title.should.be.a.Function();
      fmt.should.have.ownProperty('value');
      fmt.value.should.be.a.Function();

      fmt.title(100).should.equal('Time: 100');
      fmt.value(100).should.equal('100 microseconds');
    });

    it('should stop on mouseover', () => {
      ctrl.start();
      let fn = cfg.onmouseover;
      fn.should.be.a.Function();
      interval.cancel.should.not.be.called();
      fn();
      interval.cancel.should.be.calledOnce();
    });

    it('should start on mouseout', () => {
      ctrl.stop();
      let fn = cfg.onmouseout;
      fn.should.be.a.Function();
      interval.should.not.be.called();
      fn();
      interval.should.be.calledOnce();
    });
  });

  describe('constructChartData', () => {
    it('should leave chartData empty if no collectorData present', () => {
      ctrl.collectorData = new Map();
      ctrl.constructChartData;
      ctrl.chartData.should.deepEqual({});
    });

    it('should construct chartData according to collectorData', () => {
      let map = new Map();
      map.set('fooCollector', [{ timestamp: 100, micros: 50 }, { timestamp: 101, micros: 60 }]);
      ctrl.collectorData = map;
      ctrl.constructChartData();

      ctrl.chartData.should.deepEqual({
        fooCollector: {
          xData: ['timestamps', 101],
          yData: ['fooCollector', 10]
        }
      });
    });
  });

  describe('processData', () => {
    it('should process singleton service results', () => {
      ctrl.collectors.should.deepEqual([]);
      ctrl.chartConfigs.should.deepEqual({});
      ctrl.collectorData.has('fooCollector').should.be.false();
      let timestamp = Date.now().toString();
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestamp },
              wallTimeInMicros: { $numberLong: '50' }
            }
          ]
        }
      });
      ctrl.collectorData.has('fooCollector').should.be.true();
      ctrl.collectorData.get('fooCollector').should.be.an.Array();
      ctrl.collectorData.get('fooCollector').length.should.equal(1);
      ctrl.collectorData.get('fooCollector')[0].should.deepEqual({ timestamp: parseInt(timestamp), micros: 50 });
    });

    it('should process multiple service results', () => {
      ctrl.collectors.should.deepEqual([]);
      ctrl.chartConfigs.should.deepEqual({});
      ctrl.collectorData.has('fooCollector').should.be.false();
      let timestampA = Date.now().toString();
      let timestampB = (Date.now() - 10).toString();
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestampA },
              wallTimeInMicros: { $numberLong: '50' }
            },
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestampB },
              wallTimeInMicros: { $numberLong: '25' }
            }
          ]
        }
      });
      ctrl.collectorData.has('fooCollector').should.be.true();
      ctrl.collectorData.get('fooCollector').should.be.an.Array();
      ctrl.collectorData.get('fooCollector').length.should.equal(2);
      ctrl.collectorData.get('fooCollector')[0].should.deepEqual({ timestamp: parseInt(timestampB), micros: 25 });
      ctrl.collectorData.get('fooCollector')[1].should.deepEqual({ timestamp: parseInt(timestampA), micros: 50 });
    });

    it('should append new data', () => {
      let timestampA = Date.now().toString();
      let timestampB = (Date.now() + 5000).toString();
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestampA },
              wallTimeInMicros: { $numberLong: '50' }
            }
          ]
        }
      });
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestampB },
              wallTimeInMicros: { $numberLong: '100' }
            }
          ]
        }
      });
      ctrl.collectorData.has('fooCollector').should.be.true();
      ctrl.collectorData.get('fooCollector').should.be.an.Array();
      ctrl.collectorData.get('fooCollector').length.should.equal(2);
      ctrl.collectorData.get('fooCollector')[0].should.deepEqual({ timestamp: parseInt(timestampA), micros: 50 });
      ctrl.collectorData.get('fooCollector')[1].should.deepEqual({ timestamp: parseInt(timestampB), micros: 100 });
    });

    it('should append a sample with duplicate elapsed time if no sample received for a collector', () => {
      let timestampA = Date.now().toString();
      let timestampB = (Date.now() + 10).toString();
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestampA },
              wallTimeInMicros: { $numberLong: '100' }
            }
          ]
        }
      });
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'barCollector',
              timeStamp: { $numberLong: timestampB },
              wallTimeInMicros: { $numberLong: '200' }
            }
          ]
        }
      });
      ctrl.collectorData.get('fooCollector').length.should.equal(2);
      ctrl.collectorData.get('fooCollector')[0].should.deepEqual({ timestamp: parseInt(timestampA), micros: 100 });
      ctrl.collectorData.get('fooCollector')[1].should.deepEqual({ timestamp: parseInt(timestampB), micros: 100 });

      ctrl.collectorData.get('barCollector').length.should.equal(1);
      ctrl.collectorData.get('barCollector')[0].should.deepEqual({ timestamp: parseInt(timestampB), micros: 200 });
    });

    it('should ignore duplicate timestamps', () => {
      let timestamp = Date.now().toString();
      ctrl.processData({
        data: {
          response: [
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestamp },
              wallTimeInMicros: { $numberLong: 200 }
            },
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestamp },
              wallTimeInMicros: { $numberLong: 100 }
            },
            {
              collectorName: 'fooCollector',
              timeStamp: { $numberLong: timestamp },
              wallTimeInMicros: { $numberLong: 100 }
            }
          ]
        }
      });
      ctrl.collectorData.get('fooCollector').length.should.equal(1);
      // note: response is processed in reverse order, so 100 is seen first
      ctrl.collectorData.get('fooCollector')[0].should.deepEqual({ timestamp: parseInt(timestamp), micros: 100 });
    });
  });

  describe('ondestroy handler', () => {
    it('should exist', () => {
      scope.$on.should.be.calledWith(sinon.match('$destroy'), sinon.match.func);
    });

    it('should cancel refresh', () => {
      ctrl.refresh = 'interval-sentinel';
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh is undefined', () => {
      ctrl.refresh = undefined;
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.not.be.called();
    });
  });

  describe('multichartFn', () => {
    it('should return a promise', () => {
      let res = ctrl.multichartFn();
      res.should.be.a.Promise();
    });

    it('should resolve jvm-gc stat', done => {
      promise.then.should.be.calledOnce();
      let res = ctrl.multichartFn();
      res.then(v => {
        v.should.equal(400);
        done();
      });
      promise.then.should.be.calledTwice();
      let prom = promise.then.secondCall.args[0];
      prom({
        data: {
          response: [
            {
              wallTimeInMicros: { $numberLong: '400' }
            }
          ]
        }
      });
    });
  });

});
