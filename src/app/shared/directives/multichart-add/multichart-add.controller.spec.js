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

import controllerModule from './multichart-add.controller.js';

describe('MultichartAddController', () => {

  let svc, scope, timeout, ctrl;

  beforeEach(() => {
    angular.mock.module(controllerModule);
    angular.mock.inject($controller => {
      'ngInject';

      svc = {
        chartNames: ['foo', 'bar'],
        addService: sinon.spy(),
        removeService: sinon.spy(),
        hasServiceForChart: sinon.stub().returns(true)
      };

      scope = {
        svcName: 'foo-svc',
        getFn: sinon.spy(),
        $watch: sinon.spy()
      };

      timeout = sinon.spy();

      ctrl = $controller('MultichartAddController', {
        multichartService: svc,
        $scope: scope,
        $timeout: timeout
      });
    });
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should assign multichart names from service', () => {
    scope.multicharts.should.deepEqual(svc.chartNames);
  });

  describe('bootstrapSwitch', () => {
    let mockElem;
    beforeEach(() => {
      mockElem = {
        bootstrapSwitch: sinon.spy(),
        on: sinon.spy()
      };
      sinon.stub(angular, 'element').returns(mockElem);
    });

    afterEach(() => {
      angular.element.restore();
    });

    it('should watch on multicharts', () => {
      scope.$watch.should.be.calledWith('multicharts', sinon.match.func);
    });

    it('should use $timeout to wait for $scope $digest to complete', () => {
      timeout.should.not.be.called();
      let fn = scope.$watch.firstCall.args[1];
      fn();
      timeout.should.be.calledOnce();
      timeout.should.be.calledWith(sinon.match.func);
    });

    it('should set up bootstrapSwitch functionality for each switch', () => {
      svc.removeService.should.not.be.called();
      let fn = scope.$watch.firstCall.args[1];
      fn(['foo']);
      timeout.yield();

      angular.element.should.be.calledOnce();
      angular.element.should.be.calledWith('#foo-foo-svc');
      mockElem.bootstrapSwitch.should.be.calledOnce();
      mockElem.on.should.be.calledOnce();
      mockElem.on.should.be.calledWith('switchChange.bootstrapSwitch', sinon.match.func);
      let evtHandler = mockElem.on.firstCall.args[1];
      evtHandler({
        currentTarget: {
          getAttribute: () => 'foo-chart'
        }
      });
      svc.removeService.should.be.calledOnce();
      svc.removeService.should.be.calledWith('foo-chart', 'foo-svc');
    });
  });

  describe('isInChart', () => {
    it('should delegate to service', () => {
      svc.hasServiceForChart.should.not.be.called();
      ctrl.isInChart('foo').should.be.true();
      svc.hasServiceForChart.should.be.calledOnce();
      svc.hasServiceForChart.should.be.calledWith('foo', scope.svcName);
    });
  });

  describe('addToChart', () => {
    it('should delegate to service', () => {
      svc.addService.should.not.be.called();
      ctrl.addToChart('foo');
      svc.addService.should.be.calledOnce();
      svc.addService.should.be.calledWith('foo', scope.svcName, scope.getFn);
    });
  });

  describe('removeFromChart', () => {
    it('should delegate to service', () => {
      svc.removeService.should.not.be.called();
      ctrl.removeFromChart('foo');
      svc.removeService.should.be.calledOnce();
      svc.removeService.should.be.calledWith('foo', scope.svcName);
    });
  });

  describe('toggleChart', () => {
    it('should remove if already added', () => {
      svc.hasServiceForChart.should.not.be.called();
      svc.addService.should.not.be.called();
      svc.removeService.should.not.be.called();
      ctrl.toggleChart('foo');
      svc.hasServiceForChart.should.be.calledOnce();
      svc.hasServiceForChart.should.be.calledWith('foo', scope.svcName);
      svc.addService.should.not.be.called();
      svc.removeService.should.be.calledOnce();
      svc.removeService.should.be.calledWith('foo', scope.svcName);
    });

    it('should add if not present', () => {
      svc.hasServiceForChart.returns(false);
      svc.hasServiceForChart.should.not.be.called();
      svc.addService.should.not.be.called();
      svc.removeService.should.not.be.called();
      ctrl.toggleChart('foo');
      svc.hasServiceForChart.should.be.calledOnce();
      svc.hasServiceForChart.should.be.calledWith('foo', scope.svcName);
      svc.addService.should.be.calledOnce();
      svc.addService.should.be.calledWith('foo', scope.svcName);
      svc.removeService.should.not.be.called();
    });
  });

});
