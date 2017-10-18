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

import controllerModule from './byteman-metrics.controller.js';

describe('BytemanMetricsController', () => {

  let ctrl, translate, interval, svc, metricToNumber, timestampToDate;
  beforeEach(() => {
    angular.mock.module(controllerModule);

    translate = sinon.stub().returns({
      then: sinon.stub().yields({
        'byteman.metrics.TIMESTAMP_COL_HEADER': 'Time Stamp',
        'byteman.metrics.MARKER_COL_HEADER': 'Marker',
        'byteman.metrics.NAME_COL_HEADER': 'Name',
        'byteman.metrics.VALUE_COL_HEADER': 'Value'
      })
    });

    interval = sinon.stub().returns('interval-mock');
    interval.cancel = sinon.spy();

    svc = {};
    svc.then = sinon.stub();
    svc.getMetrics = sinon.stub().returns({ then: svc.then });

    metricToNumber = sinon.stub().returns(123);

    timestampToDate = sinon.stub().returns('mock date');

    let timestamp = Date.now();
    sinon.stub(Date, 'now').returns(timestamp);

    angular.mock.inject($controller => {
      'ngInject';
      ctrl = $controller('BytemanMetricsController', {
        $stateParams: { jvmId: 'foo-jvmId' },
        $translate: translate,
        $interval: interval,
        bytemanService: svc,
        metricToNumberFilter: metricToNumber,
        timestampToDateFilter: timestampToDate
      });
    });
  });

  afterEach(() => {
    Date.now.restore();
  });

  describe('$onInit ()', () => {
    it('should start updating', () => {
      interval.should.not.be.called();
      svc.getMetrics.should.not.be.called();

      ctrl.$onInit();

      interval.should.be.calledOnce();
      interval.should.be.calledWith(sinon.match.func, 5000);
      ctrl.should.have.ownProperty('_refresh');
      ctrl._refresh.should.equal('interval-mock');
      svc.getMetrics.should.be.calledOnce();

      let updateFn = interval.firstCall.args[0];
      updateFn();
      svc.getMetrics.should.be.calledTwice();
    });
  });

  describe('$onDestroy ()', () => {
    it('should cancel refresh if started', () => {
      interval.cancel.should.not.be.called();
      ctrl.$onInit();
      interval.cancel.should.not.be.called();
      ctrl.$onDestroy();
      interval.cancel.should.be.calledOnce();
      interval.cancel.should.be.calledWith('interval-mock');
    });

    it('should do nothing if not started', () => {
      interval.cancel.should.not.be.called();
      ctrl.$onDestroy();
      interval.cancel.should.not.be.called();
    });
  });

  describe('dataAgeLimit', () => {
    it('should trigger update with new limit', () => {
      svc.getMetrics.should.not.be.called();
      Date.now.returns(100000);
      ctrl.dataAgeLimit = '30000';
      svc.getMetrics.should.be.calledWith('foo-jvmId', 100000 - 30000);
    });

    it('should reflect in getter', () => {
      ctrl.dataAgeLimit = '30000';
      ctrl.dataAgeLimit.should.equal('30000');
    });
  });

  describe('_update ()', () => {
    it('should use jvmId and current time minus age limit', () => {
      Date.now.returns(100000);
      ctrl._dataAgeLimit = 30000;
      ctrl._update();
      svc.getMetrics.should.be.calledOnce();
      svc.getMetrics.should.be.calledWith('foo-jvmId', 100000 - 30000);
    });

    it('should set items from service', () => {
      let items = [{
        timestamp: 72000,
        marker: 'foo-marker',
        name: 'action',
        value: 'foo-method called'
      }];
      svc.then.yields(items);
      ctrl._update();
      ctrl.items.should.deepEqual(items);
      ctrl.config.itemsAvailable.should.be.true();
    });
  });

});
