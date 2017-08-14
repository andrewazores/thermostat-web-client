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

import controllerModule from './chart.controller.js';

describe('multichart chartController', () => {

  let ctrl, svc, scope, interval, dateFilter, translate;
  beforeEach(() => {
    angular.mock.module(controllerModule);
    angular.mock.inject($controller => {
      'ngInject';

      let getDataPromise = sinon.spy();
      let getData = sinon.stub().returns({
        then: getDataPromise
      });
      svc = {
        getData: getData,
        getDataPromise: getDataPromise,
        getAxesForChart: sinon.stub().returns(['y']),
        countServicesForChart: sinon.stub().returns(2),
        removeChart: sinon.spy(),
        rename: sinon.spy()
      };
      scope = {
        $parent: {
          chart: 'foo-chart'
        },
        $on: sinon.spy(),
        $watch: sinon.spy()
      };
      interval = sinon.stub().returns('interval-sentinel');
      interval.cancel = sinon.spy();
      dateFilter = sinon.stub().returns('dateFilter-sentinel');
      translate = sinon.stub().returns({
        then: sinon.stub().yields({
          'multicharts.chart.X_AXIS_LABEL': 'timestamp',
          'multicharts.chart.X_AXIS_DATA_TYPE': 'timestamp'
        })
      });

      ctrl = $controller('MultiChartChartController', {
        multichartService: svc,
        $scope: scope,
        $interval: interval,
        dateFilter: dateFilter,
        DATE_FORMAT: { time: { medium: 'medium-time' } },
        $translate: translate
      });
      ctrl.chartConfig.data = {};
    });
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should stop on destroy', () => {
    scope.$on.should.be.calledWith('$destroy');
    scope.$on.callCount.should.equal(1);
    let fn = scope.$on.args[0][1];
    fn.should.be.a.Function();

    interval.cancel.should.not.be.called();
    fn();
    interval.cancel.should.be.calledOnce();
    interval.cancel.should.be.calledWith('interval-sentinel');
  });

  it('should do nothing if stopped when already stopped', () => {
    interval.cancel.should.not.be.called();
    ctrl.stop();
    interval.cancel.should.be.calledOnce();
    ctrl.stop();
    interval.cancel.should.be.calledOnce();
  });

  it('should initialize refreshRate', () => {
    scope.should.have.ownProperty('refreshRate');
    scope.refreshRate.should.equal('2000');
  });

  it('should initialize dataAgeLimit', () => {
    scope.should.have.ownProperty('dataAgeLimit');
    scope.dataAgeLimit.should.equal('60000');
  });

  it('should begin updating at refreshRate period', () => {
    svc.getData.should.be.calledOnce();
    interval.should.be.calledOnce();
    interval.should.be.calledWithMatch(sinon.match.func, sinon.match(2000));
    let fn = interval.args[0][0];
    fn();
    svc.getData.should.be.calledTwice();
  });

  it('should watch refreshRate changes', () => {
    interval.cancel.should.not.be.called();
    scope.$watch.should.be.calledWithMatch(sinon.match('refreshRate'), sinon.match.func);
    let fn = scope.$watch.withArgs('refreshRate').args[0][1];
    fn.should.be.a.Function();
    interval.returns('foo-sentinel');
    fn(5);
    interval.cancel.should.be.calledOnce();
    ctrl.refresh.should.equal('foo-sentinel');
    interval.should.be.calledWithMatch(sinon.match.func, sinon.match(5));
  });

  it('should watch dataAgeLimit changes', () => {
    let spy = sinon.spy(ctrl, 'trimData');
    scope.$watch.should.be.calledWithMatch(sinon.match('dataAgeLimit'), sinon.match.func);
    let fn = scope.$watch.withArgs('dataAgeLimit').args[0][1];
    fn.should.be.a.Function();
    fn();
    spy.should.be.calledOnce();
    spy.restore();
  });

  describe('update', () => {
    let fn;
    beforeEach(() => {
      fn = svc.getDataPromise.args[0][0];
      fn.should.be.a.Function();
    });

    it('should pass chart ID', () => {
      ctrl.update();
      svc.getData.should.be.calledWith(scope.$parent.chart);
    });

    it('should do nothing if data is empty', () => {
      ctrl.chartData.xData.length.should.equal(1);
      fn({});
      ctrl.chartData.xData.length.should.equal(1);
    });

    it('should append new data', () => {
      ctrl.chartData.xData.length.should.equal(1);
      ctrl.should.not.have.ownProperty('yData');
      fn({
        yData: ['someMetric', 100]
      });
      ctrl.chartData.xData.length.should.equal(2);
      ctrl.chartData.should.have.ownProperty('yData');
      ctrl.chartData.yData.length.should.equal(2);
    });

    it('should append data for existing metric', () => {
      ctrl.chartData.xData.length.should.equal(1);
      ctrl.should.not.have.ownProperty('yData');
      fn({
        yData: ['someMetric', 100]
      });
      ctrl.chartData.xData.length.should.equal(2);
      ctrl.chartData.should.have.ownProperty('yData');
      ctrl.chartData.yData.length.should.equal(2);
      fn({
        yData: ['someMetric', 200]
      });
      ctrl.chartData.xData.length.should.equal(3);
      ctrl.chartData.yData.length.should.equal(3);
    });
  });

  describe('trimData', () => {
    let dateNowStub;
    beforeEach(() => {
      dateNowStub = sinon.stub(Date, 'now');
    });

    afterEach(() => {
      Date.now.restore();
    });

    it('should do nothing if chartData undefined', () => {
      delete ctrl.chartData;
      ctrl.trimData();
      should(ctrl.chartData).be.undefined();
    });

    it('should do nothing if no samples', () => {
      ctrl.trimData();
      ctrl.chartData.should.eql({
        xData: ['timestamp']
      });
    });

    it('should not trim data if only one sample', () => {
      scope.dataAgeLimit = 10;
      let updateFn = svc.getDataPromise.args[0][0];

      dateNowStub.returns(100);
      updateFn({
        yData: ['foo', 500],
        yData1: ['bar', 5000]
      });

      dateNowStub.returns(200);
      ctrl.trimData();

      ctrl.chartData.should.eql({
        xData: ['timestamp', 100],
        yData: ['foo', 500],
        yData1: ['bar', 5000]
      });
    });

    it('should trim old data', () => {
      scope.dataAgeLimit = 200;
      let updateFn = svc.getDataPromise.args[0][0];

      dateNowStub.returns(100);
      updateFn({
        yData: ['foo', 500],
        yData1: ['bar', 5000]
      });

      dateNowStub.returns(200);
      updateFn({
        yData: ['foo', 600],
        yData1: ['bar', 6000]
      });

      dateNowStub.returns(300);
      updateFn({
        yData: ['foo', 700],
        yData1: ['bar', 7000]
      });

      dateNowStub.returns(350);

      ctrl.chartData.should.eql({
        xData: ['timestamp', 100, 200, 300],
        yData: ['foo', 500, 600, 700],
        yData1: ['bar', 5000, 6000, 7000]
      });

      ctrl.trimData();

      ctrl.chartData.should.eql({
        xData: ['timestamp', 200, 300],
        yData: ['foo', 600, 700],
        yData1: ['bar', 6000, 7000]
      });
    });
  });

  describe('initializeChartData', () => {
    it('should set chartId', () => {
      ctrl.chartConfig.chartId.should.equal('chart-foo-chart');
    });

    it('should format x-axis ticks using dateFilter', () => {
      dateFilter.should.not.be.called();
      let fmtFn = ctrl.chartConfig.axis.x.tick.format;
      fmtFn(100).should.equal('dateFilter-sentinel');
      dateFilter.should.be.calledOnce();
      dateFilter.should.be.calledWith(100, 'medium-time');
    });

    it('should format y-axis ticks with identity function', () => {
      let fmtFn = ctrl.chartConfig.axis.y.tick.format;
      fmtFn(1).should.equal(1);
      fmtFn('foo').should.equal('foo');
    });

    it('should show y2 axis if suggested by service', () => {
      svc.countServicesForChart.should.not.be.called();
      let res = ctrl.chartConfig.axis.y2.show;
      res.should.equal(true);
      svc.countServicesForChart.should.be.calledOnce();
      svc.countServicesForChart.should.be.calledWith('foo-chart');
    });

    it('should format tooltips', () => {
      let titleFmt = ctrl.chartConfig.tooltip.format.title;
      let valueFmt = ctrl.chartConfig.tooltip.format.value;

      titleFmt('foo').should.equal('foo');
      titleFmt(100).should.equal(100);

      valueFmt('foo').should.equal('foo');
      valueFmt(100).should.equal(100);
    });
  });

  describe('removeChart', () => {
    it('should delegate to service', () => {
      svc.removeChart.should.not.be.called();
      ctrl.removeChart();
      svc.removeChart.should.be.calledOnce();
      svc.removeChart.should.be.calledWith('foo-chart');
    });
  });

  describe('setRefreshRate', () => {
    it('should stop previous refreshes', () => {
      interval.cancel.should.not.be.called();
      ctrl.setRefreshRate(5);
      interval.cancel.should.be.calledOnce();
    });

    it('should set the new update interval', () => {
      interval.should.be.calledOnce();
      ctrl.setRefreshRate(5);
      interval.should.be.calledTwice();
      interval.secondCall.should.be.calledWith(sinon.match.func, 5);
    });

    it('should perform updates at each interval', () => {
      ctrl.setRefreshRate(5);
      svc.getData.should.be.calledOnce();
      let fn = interval.secondCall.args[0];
      fn();
      svc.getData.should.be.calledTwice();
    });

    it('should cancel if given non-positive value', () => {
      interval.cancel.should.not.be.called();
      svc.getData.should.be.calledOnce();
      ctrl.setRefreshRate(-1);
      interval.cancel.should.be.calledOnce();
      svc.getData.should.be.calledOnce();
    });
  });

  describe('rename', () => {
    it('should delegate to service', () => {
      svc.rename.should.not.be.called();
      ctrl.rename('newname');
      svc.rename.should.be.calledOnce();
      svc.rename.should.be.calledWith('foo-chart', 'newname');
    });

    it('should do nothing if chart name is empty', () => {
      svc.rename.should.not.be.called();
      ctrl.rename('');
      svc.rename.should.not.be.called();
    });

    it('should do nothing if chart name is invalid', () => {
      svc.rename.should.not.be.called();
      ctrl.rename('with space');
      svc.rename.should.not.be.called();
    });
  });

});
