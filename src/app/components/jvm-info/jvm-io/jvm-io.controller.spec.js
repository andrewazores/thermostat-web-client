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

import controllerModule from './jvm-io.controller.js';

describe('JvmIoController', () => {

  let ctrl, svc, interval, translations, translate,
    dateFilter, dateFormat, metricToNumberFilter;
  beforeEach(() => {
    angular.mock.module(controllerModule);
    angular.mock.inject($controller => {
      'ngInject';
      let svcPromise = sinon.stub();
      svc = {
        getJvmIoData: sinon.stub().returns({
          then: svcPromise
        }),
        getHistoricalData: sinon.stub().returns({
          then: svcPromise
        }),
        promise: svcPromise
      };
      interval = sinon.stub().returns('intervalMock');
      interval.cancel = sinon.spy();

      translations = {
        'jvmIo.metrics.timestamp': 'date',
        'jvmIo.metrics.charactersRead': 'characters read',
        'jvmIo.metrics.charactersWritten': 'characters written',
        'jvmIo.metrics.readSyscalls': 'read sys calls',
        'jvmIo.metrics.writeSyscalls': 'write sys calls'
      };
      let translateThenThen = sinon.stub().yields();
      translate = sinon.stub().returns({
        then: sinon.stub().yields(translations).returns({
          then: translateThenThen
        })
      });

      dateFilter = sinon.stub().returns('dateFilterMock');
      dateFormat = {
        time: {
          medium: 'dateFormatMedium'
        }
      };
      metricToNumberFilter = sinon.stub().callsFake(v => parseInt(v.$numberLong));

      ctrl = $controller('JvmIoController', {
        jvmIoService: svc,
        $interval: interval,
        $translate: translate,
        dateFilter: dateFilter,
        DATE_FORMAT: dateFormat,
        metricToNumberFilter: metricToNumberFilter
      });
      ctrl.jvmId = 'foo-jvmId';
    });
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  describe('properties', () => {
    it('should set refresh rate to 10 seconds', () => {
      ctrl.refreshRate.should.equal('10000');
    });

    it('should set data age limit to 10 minutes', () => {
      ctrl.dataAgeLimit.should.equal('600000');
    });

    it('should use translations', () => {
      translate.should.be.calledWith([
        'jvmIo.chart.X_LABEL',
        'jvmIo.chart.Y1_LABEL',
        'jvmIo.chart.Y2_LABEL',

        'jvmIo.metrics.timestamp',
        'jvmIo.metrics.charactersRead',
        'jvmIo.metrics.charactersWritten',
        'jvmIo.metrics.readSyscalls',
        'jvmIo.metrics.writeSyscalls',
      ]);
    });
  });

  describe('$onInit ()', () => {
    beforeEach(() => {
      ctrl.$onInit();
    });

    it('should load historical data', () => {
      svc.getHistoricalData.should.be.calledOnce();
    });

    it('should start periodic live updates', () => {
      interval.should.be.calledOnce();
    });
  });

  describe('chart config', () => {
    it('should format x-axis ticks', () => {
      let fn = ctrl.config.axis.x.tick.format;
      fn(100).should.equal('dateFilterMock');
    });

    it('should provide an identity y-axis tick format function', () => {
      let fn = ctrl.config.axis.y.tick.format;
      fn(100).should.equal(100);
      fn(200).should.equal(200);
    });

    it('should provide an identity y2-axis tick format function', () => {
      let fn = ctrl.config.axis.y2.tick.format;
      fn(100).should.equal(100);
      fn(200).should.equal(200);
    });

    it('should provide identity tooltip format functions', () => {
      let title = ctrl.config.tooltip.format.title;
      title(100).should.equal(100);
      title(200).should.equal(200);
      let value = ctrl.config.tooltip.format.value;
      value(100).should.equal(100);
      value(200).should.equal(200);
    });
  });

  describe('$onDestroy', () => {
    it('should do nothing if controller is not started', () => {
      interval.cancel.should.not.be.called();
      ctrl.$onDestroy();
      interval.cancel.should.not.be.called();
    });

    it('should stop the controller if already started', () => {
      ctrl._start();
      interval.cancel.should.not.be.called();
      ctrl.$onDestroy();
      interval.cancel.should.be.calledOnce();
    });
  });

  describe('refreshRate', () => {
    it('should set interval and disable if <= 0', () => {
      interval.should.not.be.called();
      ctrl.refreshRate = 10000;
      interval.cancel.should.not.be.called();
      interval.should.be.calledOnce();
      interval.should.be.calledWith(sinon.match.func, 10000);
      ctrl.refreshRate = -1;
      interval.cancel.should.be.calledOnce();
      interval.should.be.calledOnce();
    });

    it('should reflect changes in getter', () => {
      ctrl.refreshRate.should.equal('10000');
      ctrl.refreshRate = 2000;
      ctrl.refreshRate.should.equal('2000');
    });
  });

  describe('dataAgeLimit', () => {
    it('should cause a data clear on change', () => {
      sinon.spy(ctrl, '_clearData');
      ctrl._clearData.should.not.be.called;
      ctrl.dataAgeLimit = 10000;
      ctrl._clearData.should.be.calledOnce();
      ctrl._clearData.restore();
    });

    it('should cause a historical data load on change', () => {
      sinon.spy(ctrl, '_loadHistoricalData');
      ctrl._loadHistoricalData.should.not.be.called;
      ctrl.dataAgeLimit = 10000;
      ctrl._loadHistoricalData.should.be.calledOnce();
      ctrl._loadHistoricalData.restore();
    });

    it('should reflect changes in getter', () => {
      ctrl.dataAgeLimit.should.equal('600000');
      ctrl.dataAgeLimit = 10000;
      ctrl.dataAgeLimit.should.equal('10000');
    });
  });

  describe('_start', () => {
    it('should perform updates on an interval', () => {
      interval.should.not.be.called();
      ctrl._start();
      interval.should.be.calledOnce();
      interval.should.be.calledWith(sinon.match.func, 10000);

      let func = interval.args[0][0];
      svc.getJvmIoData.should.not.be.called();
      func();
      svc.getJvmIoData.should.be.calledOnce();
    });
  });

  describe('_stop', () => {
    it('should do nothing if not started', () => {
      interval.cancel.should.not.be.called();
      ctrl._stop();
      interval.cancel.should.not.be.called();
    });
  });

  describe('_loadHistoricaldata', () => {
    it('should add update data to chart data', () => {
      ctrl._loadHistoricalData();
      svc.promise.should.be.calledOnce();
      svc.promise.should.be.calledWith(sinon.match.func);
      let stamp = Date.now();
      svc.promise.args[0][0](
        [
          {
            timeStamp: { $numberLong: (stamp - 10000).toString() },
            charactersRead: { $numberLong: '1000000' },
            charactersWritten: { $numberLong: '500000' },
            readSyscalls: { $numberLong: '100' },
            writeSyscalls: { $numberLong: '50' }
          },
          {
            timeStamp: { $numberLong: stamp.toString() },
            charactersRead: { $numberLong: '1000001' },
            charactersWritten: { $numberLong: '500001' },
            readSyscalls: { $numberLong: '101' },
            writeSyscalls: { $numberLong: '51' }
          }
        ]
      );
      ctrl.config.data.rows.should.deepEqual([
        ['date', 'characters read', 'characters written', 'read sys calls', 'write sys calls'],
        [(stamp - 10000), 1000000, 500000, 100, 50],
        [stamp, 1000001, 500001, 101, 51]
      ]);
    });
  });

  describe('_update', () => {
    it('should add update data to chart data', () => {
      ctrl._update();
      svc.promise.should.be.calledOnce();
      svc.promise.should.be.calledWith(sinon.match.func);
      let stamp = Date.now();
      svc.promise.args[0][0](
        {
          timeStamp: { $numberLong: stamp.toString() },
          charactersRead: { $numberLong: '1000000' },
          charactersWritten: { $numberLong: '500000' },
          readSyscalls: { $numberLong: '100' },
          writeSyscalls: { $numberLong: '50' }
        }
      );
      ctrl.config.data.rows.should.deepEqual([
        ['date', 'characters read', 'characters written', 'read sys calls', 'write sys calls'],
        [stamp, 1000000, 500000, 100, 50]
      ]);
    });
  });

  describe('_trimData', () => {
    it('should remove datasets older than dataAgeLimit', () => {
      let now = Date.now();
      let expired = now - ctrl._dataAgeLimit - 1;
      ctrl.config.data.rows.push([
        expired, 1, 1, 1, 1
      ]);
      ctrl.config.data.rows.push([
        now, 2, 2, 2, 2
      ]);
      ctrl._trimData();
      ctrl.config.data.rows.should.deepEqual([
        ['date', 'characters read', 'characters written', 'read sys calls', 'write sys calls'],
        [now, 2, 2, 2, 2]
      ]);
    });
  });

});
