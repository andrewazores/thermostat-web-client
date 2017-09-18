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

import controllerModule from './multichart.controller.js';

describe('MultiChartController', () => {

  let svc, ctrl, translate, newChartForm;
  beforeEach(() => {
    angular.mock.module(controllerModule);
    angular.mock.inject($controller => {
      'ngInject';

      newChartForm = {
        $setPristine: sinon.spy(),
        $setUntouched: sinon.spy()
      };
      svc = {
        addChart: sinon.spy(),
        chartNames: ['foo', 'bar']
      };
      translate = sinon.stub().returns({
        then: sinon.stub().yields()
      });
      ctrl = $controller('MultichartController', {
        multichartService: svc,
        $translate: translate
      });
      ctrl.form = newChartForm;
    });
  });

  it('should exist', () => {
    should(ctrl).not.be.undefined();
  });

  it('should initialize showErr to false', () => {
    ctrl.showErr.should.be.false();
  });

  it('should return chartNames from service', () => {
    ctrl.chartNames.should.deepEqual(['foo', 'bar']);
  });

  describe('createChart', () => {
    it('should do nothing if chartName is undefined', () => {
      svc.addChart.should.not.be.called();
      ctrl.createChart();
      svc.addChart.should.not.be.called();
      ctrl.showErr.should.be.false();
    });

    it('should reset form and call to service on success', () => {
      svc.addChart.should.not.be.called();
      ctrl.newChartName = 'foo';
      ctrl.createChart();
      svc.addChart.should.be.calledOnce();
      svc.addChart.should.be.calledWith('foo');
      ctrl.newChartName.should.equal('');
      newChartForm.$setUntouched.should.be.calledOnce();
      newChartForm.$setPristine.should.be.calledOnce();
    });

    it('should trim spaces from chart names', () => {
      ctrl.newChartName = ' foo ';
      ctrl.createChart();
      svc.addChart.should.be.calledWith('foo');
    });

    it('should set showErr to false on success', () => {
      ctrl.createChart('foo');
      ctrl.showErr.should.be.false();
    });

    it('should set showErr to true on error', () => {
      ctrl.newChartName = '<script>alert();</script>';
      ctrl.createChart();
      ctrl.showErr.should.be.true();
      svc.addChart.should.not.be.called();
    });
  });

  describe('isValid', () => {
    it('should reject undefined', () => {
      ctrl.isValid(undefined).should.be.false();
    });

    it('should reject null', () => {
      ctrl.isValid(null).should.be.false();
    });

    it('should reject empty string', () => {
      ctrl.isValid('').should.be.false();
    });

    it('should reject HTML-formatted string', () => {
      ctrl.isValid('<b>chart</b>').should.be.false();
    });

    it('should reject HTML script tag', () => {
      ctrl.isValid('<script>alert("foo");</script>').should.be.false();
    });

    it('should reject string with spaces', () => {
      ctrl.isValid('foo ').should.be.false();
    });

    it('should accept plain single word', () => {
      ctrl.isValid('foo').should.be.true();
    });

    it('should accept words separated by hyphens', () => {
      ctrl.isValid('foo-system').should.be.true();
    });

    it('should accept a name comprised of hyphens and underscores', () => {
      ctrl.isValid('-_--_-').should.be.true();
    });

    it('should accept words separated by underscores', () => {
      ctrl.isValid('foo_system');
    });

    it('should accept numbers', () => {
      ctrl.isValid('1').should.be.true();
    });
  });

});
