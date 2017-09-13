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

import controllerModule from './system-memory.controller.js';

describe('SystemMemoryController', () => {

  beforeEach(angular.mock.module(controllerModule));

  let service, interval, memoryPromise, controller,
    dateFilterStub, dateFormatSpy, translate;

  beforeEach(inject($controller => {
    'ngInject';

    memoryPromise = {
      then: sinon.spy()
    };
    service = {
      memoryPromise: memoryPromise,
      getMemoryInfo: sinon.stub().returns(memoryPromise)
    };

    dateFilterStub = sinon.stub().returns('mockDate');
    dateFormatSpy = {
      time: {
        medium: sinon.spy()
      }
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.stub().returns(interval.sentinel);

    translate = sinon.stub().returns({
      then: sinon.stub().yields({
        'systemMemory.X_AXIS_LABEL': 'Time',
        'systemMemory.Y_AXIS_LABEL': 'Size (MiB)',
        'systemMemory.xAxisTypes.TIMESTAMP': 'timestamp',
        'systemMemory.xAxisTypes.TOTAL': 'Total Memory',
        'systemMemory.xAxisTypes.FREE': 'Free Memory',
        'systemMemory.xAxisTypes.USED': 'Used Memory',
        'systemMemory.xAxisTypes.SWAP_TOTAL': 'Total Swap',
        'systemMemory.xAxisTypes.SWAP_FREE': 'Free Swap',
        'systemMemory.xAxisTypes.BUFFERS': 'Buffers',
      })
    });

    controller = $controller('SystemMemoryController', {
      systemMemoryService: service,
      $interval: interval,
      dateFilter: dateFilterStub,
      DATE_FORMAT: dateFormatSpy,
      $translate: translate
    });
    controller.systemId = 'foo-systemId';
    controller.$onInit();
  }));

  it('should exist', () => {
    should.exist(controller);
    should.exist(service);
  });

  it('should start on initialization', () => {
    interval.should.be.calledOnce();
  });

  it('should call to service on update', () => {
    controller._update();
    service.getMemoryInfo.should.be.called();
    memoryPromise.then.should.be.calledWith(sinon.match.func);
    let successHandler = memoryPromise.then.args[0][0];
    successHandler({
      data: {
        response: {
          systemId: 'foo-systemId',
          agentId: 'mock-agentId',
          timeStamp: Date.now(),
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
    let errorHandler = memoryPromise.then.args[0][1];
    errorHandler.should.equal(angular.noop);
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
    interval.should.be.calledOnce();
    interval.cancel.should.not.be.called();
    controller.refreshRate = 1;
    interval.should.be.calledTwice();
    interval.cancel.should.be.calledOnce();
  });

  it('should disable when refresh rate is set to non-positive value', () => {
    interval.should.be.calledOnce();
    interval.cancel.should.not.be.called();

    controller.refreshRate = 1;

    interval.should.be.calledTwice();
    interval.cancel.should.be.calledOnce();

    controller.refreshRate = -1;

    interval.should.be.calledTwice();
    interval.cancel.should.be.calledTwice();
  });

  describe('multichartFn', () => {
    it('should return a promise', () => {
      let res = controller.multichartFn();
      res.should.be.a.Promise();
    });

    [[50, 45, 10], [100, 20, 80], [500, 50, 90]].forEach(tup => {
      it('should resolve system-memory stat (' + tup + ')', done => {
        service.memoryPromise.then.should.be.calledOnce();
        let res = controller.multichartFn();
        res.then(v => {
          v.should.equal(tup[2]);
          done();
        });
        service.memoryPromise.then.should.be.calledTwice();
        let prom = service.memoryPromise.then.args[1][0];
        prom({
          data: {
            response: [
              {
                total: tup[0],
                free: tup[1]
              }
            ]
          }
        });
      });
    });

  });

  it('should call _update() on refresh', () => {
    controller.refreshRate = 1;
    controller.refreshRate.should.equal('1');
    let intervalFn = interval.args[0][0];
    let callCount = service.getMemoryInfo.callCount;
    intervalFn();
    service.getMemoryInfo.callCount.should.equal(callCount + 1);
  });

  it ('should call trimData() on dataAgeLimit change', () => {
    sinon.spy(controller, '_trimData');
    controller._trimData.should.not.be.called();
    controller.dataAgeLimit = 30000;
    controller.dataAgeLimit.should.equal('30000');
    controller._trimData.should.be.calledOnce();
  });

  describe('chart configs', () => {
    it('should set an initial config object', () => {
      controller.should.have.ownProperty('donutConfig');
      controller.should.have.ownProperty('lineConfig');
    });

    it('should use dateFilter with DATE_FORMAT.time.medium to format x ticks', () => {
      let fn = controller.lineConfig.axis.x.tick.format;
      fn.should.be.a.Function();
      fn('fooTimestamp').should.equal('mockDate');
      dateFilterStub.should.be.calledWith('fooTimestamp', dateFormatSpy.time.medium);
    });


    it('line chart should set a custom tooltip', () => {
      let tooltipFormat = controller.lineConfig.tooltip.format;
      tooltipFormat.should.have.ownProperty('value');
      tooltipFormat.value.should.be.a.Function();
      tooltipFormat.value(100).should.equal('100 MiB');
    });
  });

  describe('_processData', () => {
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestamp,
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestampA,
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
              timeStamp: timestampB,
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestampA,
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestampB,
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestampA,
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
      controller._processData({
        data: {
          response: [
            {
              systemId: 'foo-systemId',
              agentId: 'mock-agentId',
              timeStamp: timestampB,
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
    it('should cancel refresh', () => {
      controller.$onDestroy();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh undefined', () => {
      delete controller._refresh;
      controller.$onDestroy();
      interval.cancel.should.not.be.called();
    });
  });
});
