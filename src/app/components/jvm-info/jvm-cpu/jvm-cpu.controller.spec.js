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

import filtersModule from 'shared/filters/filters.module.js';
import controllerModule from './jvm-cpu.controller.js';

describe('JvmCpuController', () => {

  beforeEach(angular.mock.module(filtersModule));
  beforeEach(angular.mock.module(controllerModule));

  let interval, dateFilterStub, metricToNumberFilterStub, dateFormatSpy, svc, promise, ctrl, translate;
  beforeEach(inject(($controller) => {
    'ngInject';

    dateFilterStub = sinon.stub().returns('mockDate');
    dateFormatSpy = {
      time: {
        medium: sinon.spy()
      }
    };

    metricToNumberFilterStub = sinon.stub().returns(Date.now());

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.spy();

    promise = { then: sinon.spy() };
    svc = { getJvmCpuData: sinon.stub().returns(promise) };

    translate = sinon.stub().returns({
      then: sinon.stub().yields({
        'jvmCpu.chart.UNITS': 'microseconds',
        'jvmCpu.chart.X_AXIS_LABEL': 'timestamp',
        'jvmCpu.chart.Y_AXIS_LABEL': 'elapsed'
      }).returns({
        then: sinon.stub().yields()
      })
    });

    ctrl = $controller('JvmCpuController', {
      $stateParams: { jvmId: 'foo-jvmId' },
      jvmCpuService: svc,
      $interval: interval,
      $translate: translate,
      dateFilter: dateFilterStub,
      DATE_FORMAT: dateFormatSpy,
      metricToNumberFilter: metricToNumberFilterStub
    });
    ctrl.$onInit();
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should update on init', () => {
    svc.getJvmCpuData.should.be.calledOnce();
    svc.getJvmCpuData.should.be.calledWith('foo-jvmId');
  });

  it('should call to service on update', () => {
    svc.getJvmCpuData.should.be.calledOnce();
    promise.then.should.be.calledOnce();
    ctrl._update();
    svc.getJvmCpuData.should.be.calledTwice();
    promise.then.should.be.calledTwice();

    promise.then.secondCall.should.be.calledWith(sinon.match.func);
    ctrl.data.should.deepEqual({
      xData: ['timestamp'],
      yData: ['CPU Load']
    });
    let successHandler = promise.then.secondCall.args[0];
    successHandler({
      data: {
        response: [
          {
            cpuLoad: 0.25,
            programTicks: { $numberLong: '2' },
            timeStamp: { $numberLong: '100' }
          }
        ]
      }
    });
  });

  it('should reset interval on refreshRate change', () => {
    ctrl.should.have.ownProperty('_refresh');
    ctrl.refreshRate = '1';
    interval.should.be.calledWith(sinon.match.func, sinon.match(1));
    ctrl.should.have.ownProperty('_refresh');
    ctrl._refresh.should.equal('interval-sentinel');
    ctrl.refreshRate.should.equal('1');
  });

  it('should trim data on dataAgeLimit change', () => {
    sinon.spy(ctrl, '_trimData');
    ctrl._trimData.should.not.be.called();
    ctrl.dataAgeLimit = 10000;
    ctrl._trimData.should.be.calledOnce();
    ctrl._trimData.restore();
    ctrl.dataAgeLimit.should.equal('10000');
  });


  it('should trim old data', () => {
    let oldSample = {
      cpuLoad: 0.125,
      timestamp: 1
    };

    let futureSample = {
      cpuLoad: 0.25,
      timestamp: Date.now() + 600000
    };

    ctrl._xData = ['timestamp', oldSample.timestamp, futureSample.timestamp];
    ctrl._yData = ['utilization', oldSample.cpuLoad, futureSample.cpuLoad];
    ctrl.data = {
      xData: ctrl._xData,
      yData: ctrl._yData
    };
    ctrl._trimData();

    ctrl.data.should.deepEqual({
      xData: ['timestamp', futureSample.timestamp],
      yData: ['utilization', futureSample.cpuLoad]
    });
  });

  it('should set interval on start', () => {
    interval.should.be.calledOnce();
    interval.should.be.calledWith(sinon.match.func, '2000');
    interval.cancel.should.not.be.called();
  });

  it('should disable when set refreshRate is called with a non-positive value', () => {
    interval.cancel.should.not.be.called();

    ctrl.refreshRate = '1';

    interval.cancel.should.be.calledOnce();
    ctrl.should.have.ownProperty('_refresh');

    ctrl.refreshRate = '-1';

    interval.cancel.should.be.calledTwice();
    ctrl.should.not.have.ownProperty('_refresh');
  });

  it('should call controller#update() on refresh', () => {
    ctrl.refreshRate = 1;
    let func = interval.args[0][0];
    let callCount = svc.getJvmCpuData.callCount;
    func();
    svc.getJvmCpuData.callCount.should.equal(callCount + 1);
  });

  describe('_makeConfig', () => {
    let cfg;
    beforeEach(() => {
      ctrl._makeConfig('fooCollector');
      cfg = ctrl.config;
    });

    it('should return a promise', () => {
      ctrl._makeConfig().should.be.a.Promise();
    });

    it('should set chartId', () => {
      cfg.chartId.should.equal('jvm-cpu-chart');
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

      fmt.title(100).should.equal(100);
      fmt.value(200).should.equal(200);
    });

    it('should stop on mouseover', () => {
      ctrl._start();
      let fn = cfg.onmouseover;
      fn.should.be.a.Function();
      interval.cancel.should.be.calledOnce();
      fn();
      interval.cancel.should.be.calledTwice();
    });

    it('should start on mouseout', () => {
      ctrl._stop();
      let fn = cfg.onmouseout;
      fn.should.be.a.Function();
      interval.should.be.calledOnce();
      fn();
      interval.should.be.calledTwice();
    });
  });

  describe('ondestroy handler', () => {
    it('should cancel refresh', () => {
      ctrl._refresh = 'interval-sentinel';
      ctrl.$onDestroy();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh is undefined', () => {
      delete ctrl._refresh;
      ctrl.$onDestroy();
      interval.cancel.should.not.be.called();
    });
  });

  describe('multichartFn', () => {
    it('should return a promise', () => {
      let res = ctrl.multichartFn();
      res.should.be.a.Promise();
    });

    it('should resolve jvm-cpu stat', done => {
      promise.then.should.be.calledOnce();
      let res = ctrl.multichartFn();
      res.then(v => {
        v.should.equal(0.4);
        done();
      });
      promise.then.should.be.calledTwice();
      let prom = promise.then.secondCall.args[0];
      prom({
        data: {
          response: [
            {
              cpuLoad: 0.4,
              programTicks: 200,
              timeStamp: { $numberLong: '1000' }
            }
          ]
        }
      });
    });
  });

});
