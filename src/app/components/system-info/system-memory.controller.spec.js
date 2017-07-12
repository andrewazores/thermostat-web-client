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

describe('SystemMemoryController', () => {

  beforeEach(angular.mock.module('systemMemory.controller'));

  let service, scope, interval, memoryPromise, controller, unixToDate;

  beforeEach(inject($controller => {
    'ngInject';

    let systemPromise = sinon.spy();
    let cpuPromise = sinon.spy();
    memoryPromise = {
      then: sinon.spy()
    };
    service = {
      systemPromise: systemPromise,
      cpuPromise: cpuPromise,
      memoryPromise: memoryPromise,
      getSystemInfo: sinon.stub().returns({ then: systemPromise }),
      getCpuInfo: sinon.stub().returns({ then: cpuPromise }),
      getMemoryInfo: sinon.stub().returns(memoryPromise)
    };

    scope = {
      $on: sinon.spy(),
      $watch: sinon.spy(),
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.stub().returns(interval.sentinel);
    unixToDate = sinon.stub().returns('mockDate');
    controller = $controller('systemMemoryController', {
      systemId: 'foo-systemId',
      systemInfoService: service,
      $scope: scope,
      $interval: interval,
      unixToDateFilter: unixToDate,
    });

  }));

  it('should exist', () => {
    should.exist(controller);
    should.exist(service);
  });

  it('should update on initialization', () => {
    service.getMemoryInfo.should.be.called();
  });

  it('should call to service on update', () => {
    controller.update();
    service.getMemoryInfo.should.be.called();
    memoryPromise.then.should.be.calledWith(sinon.match.func);
    let successHandler = memoryPromise.then.args[1][0];
    successHandler({
      data: {
        response: {
          systemId: 'foo-systemId',
          agentId: 'mock-agentId',
          timestamp: Date.now(),
          total: 16384,
          free: 0,
          buffers: 1,
          cached: 2,
          swapTotal: 3,
          swapFree: 4,
          commitLimit: 0
        }
      }
    });
    let errorHandler = memoryPromise.then.args[1][1];
    errorHandler.should.equal(angular.noop);
    errorHandler();
  });

  it('should set initial data objects', () => {
    controller.should.have.ownProperty('donutData');
    controller.donutData.should.deepEqual({
      used: 0,
      total: 100
    });
    controller.should.have.ownProperty('lineData');
    controller.lineData.should.deepEqual({
      xData: ['timestamp'],
      yData0: ['Total Memory'],
      yData1: ['Free Memory'],
      yData2: ['Used Memory'],
      yData3: ['Total Swap'],
      yData4: ['Free Swap'],
      yData5: ['Buffers']
    });
  });

  it('should set interval on setting refresh rate', () => {
    interval.should.not.be.called();
    interval.cancel.should.not.be.called();
    controller.setRefreshRate(1);
    interval.should.be.called();
    interval.cancel.should.not.be.called();
  });

  it('should disable when setRefreshRate is called with a non-positive value', () => {
    interval.cancel.should.not.be.called();
    controller.setRefreshRate.should.not.be.called();
    controller.update.should.not.be.called();

    controller.setRefreshRate(1);

    interval.cancel.should.not.be.called();
    controller.should.have.ownProperty('refresh');

    controller.setRefreshRate(-1);

    interval.cancel.should.be.calledOnce();
    controller.should.not.have.ownProperty('refresh');
  });

  it('should call update() on refresh', () => {
    scope.$watch.should.be.calledWith(sinon.match('refreshRate'), sinon.match.func);
    let refreshFn = scope.$watch.args[0][1];
    refreshFn.should.be.a.Function();
    refreshFn(1);
    let intervalFn = interval.args[0][0];
    let callCount = service.getMemoryInfo.callCount;
    intervalFn();
    service.getMemoryInfo.callCount.should.equal(callCount + 1);

  });

  it ('should call trimData() on dataAgeLimit change', () => {
    scope.$watch.should.be.calledWith(sinon.match('dataAgeLimit'));
    scope.$watch.args[1][0].should.equal('dataAgeLimit');
    let watchFn = scope.$watch.args[1][1];
    watchFn.should.be.a.Function();
    controller.trimData = sinon.spy();
    let callCount = controller.trimData.callCount;
    watchFn();
    controller.trimData.callCount.should.equal(callCount + 1);
  });

  describe('chart configs', () => {
    it('should set an initial config object', () => {
      controller.should.have.ownProperty('donutConfig');
      controller.should.have.ownProperty('lineConfig');
    });

    it('linechart should use unixToDateFilter to format x ticks', () => {
      let tickFn = controller.lineConfig.axis.x.tick.format;
      tickFn.should.be.a.Function();
      tickFn('fooTimestamp').should.equal('mockDate');
      unixToDate.should.be.calledWith('fooTimestamp', 'LTS');
    });

    it('line chart should set a custom tooltip', () => {
      let tooltipFormat = controller.lineConfig.tooltip.format;
      tooltipFormat.should.have.ownProperty('value');
      tooltipFormat.value.should.be.a.Function();
      tooltipFormat.value(100).should.equal('100 MiB');
    });
  });

  describe('processData', () => {
    it('should process singleton service results', () => {
      controller.donutData.should.deepEqual({
        used: 0,
        total: 100
      });
      controller.lineData.should.deepEqual({
        xData: ['timestamp'],
        yData0: ['Total Memory'],
        yData1: ['Free Memory'],
        yData2: ['Used Memory'],
        yData3: ['Total Swap'],
        yData4: ['Free Swap'],
        yData5: ['Buffers']
      });
      let timestamp = Date.now();
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestamp,
              total: 16384,
              free: 0,
              buffers: 1,
              cached: 2,
              swapTotal: 3,
              swapFree: 4,
              commitLimit: 0
            }
          ]
        }
      });
      controller.donutData.should.deepEqual({
        used: 100,
        total: 100
      });
      controller.lineData.should.deepEqual({
        xData: ['timestamp', timestamp],
        yData0: ['Total Memory', 16384],
        yData1: ['Free Memory', 0],
        yData2: ['Used Memory', 16384],
        yData3: ['Total Swap', 3],
        yData4: ['Free Swap', 4],
        yData5: ['Buffers', 1]
      });
    });

    it('should process multiple service results', () => {
      controller.donutData.should.deepEqual({
        used: 0,
        total: 100
      });
      controller.lineData.should.deepEqual({
        xData: ['timestamp'],
        yData0: ['Total Memory'],
        yData1: ['Free Memory'],
        yData2: ['Used Memory'],
        yData3: ['Total Swap'],
        yData4: ['Free Swap'],
        yData5: ['Buffers']
      });
      let timestampA = Date.now();
      let timestampB = Date.now() - 1000;
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampA,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            },
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampB,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            }
          ]
        }
      });
      controller.lineData.xData.length.should.equal(3);
      controller.lineData.xData[1].should.equal(timestampB);
      controller.lineData.xData[2].should.equal(timestampA);
    });

    it('should append new data to line chart data object', () => {
      let timestampA = Date.now();
      let timestampB = Date.now() + 1000;
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampA,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            }
          ]
        }
      });
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampB,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            }
          ]
        }
      });
      controller.lineData.xData.length.should.equal(3);
      controller.lineData.xData[1].should.equal(timestampA);
      controller.lineData.xData[2].should.equal(timestampB);
    });

    it('should remove data that is older than dataAgeLimit', () => {
      controller.dataAgeLimit = 30000;
      let timestampA = Date.now() - 30001;
      let timestampB = Date.now;
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampA,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            }
          ]
        }
      });
      controller.processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timestamp: timestampB,
              total: 16384,
              free: 0,
              buffers: 0,
              cached: 0,
              swapTotal: 0,
              swapFree: 0,
              commitLimit: 0
            }
          ]
        }
      });
      controller.lineData.xData.length.should.equal(2);
      controller.lineData.xData[1].should.equal(timestampB);
    });
  });

  describe('on destroy', () => {
    it('should set an ondestroy handler', () => {
      scope.$on.should.be.calledWith('$destroy', sinon.match.func);
    });

    it('should cancel refresh', () => {
      controller.refresh = 'interval-sentinel';
      let refreshFn = scope.$on.args[0][1];
      refreshFn();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh undefined', () => {
      controller.refresh = undefined;
      let refreshFn = scope.$on.args[0][1];
      refreshFn();
      interval.cancel.should.not.be.called();
    });
  });
});
