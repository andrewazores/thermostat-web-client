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

describe('SystemCpuController', () => {

  beforeEach(angular.mock.module('systemCpu.controller'));

  let service, scope, interval, controller;
  beforeEach(inject($controller => {
    'ngInject';

    let systemPromise = sinon.spy();
    let cpuPromise = sinon.spy();
    let memoryPromise = sinon.spy();
    service = {
      systemPromise: systemPromise,
      cpuPromise: cpuPromise,
      memoryPromise: memoryPromise,
      getSystemInfo: sinon.stub().returns({ then: systemPromise }),
      getCpuInfo: sinon.stub().returns({ then: cpuPromise }),
      getMemoryInfo: sinon.stub().returns({ then: memoryPromise })
    };

    scope = {
      $on: sinon.spy(),
      systemId: 'foo-systemId'
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.stub().returns(interval.sentinel);
    controller = $controller('systemCpuController', {
      systemInfoService: service,
      $scope: scope,
      $interval: interval
    });
  }));

  it('should exist', () => {
    should.exist(controller);
    should.exist(service);
  });

  it('should set an initial data object', () => {
    controller.should.have.ownProperty('data');
    controller.data.should.deepEqual({
      used: 0,
      total: 0
    });
  });

  it('should set an initial config object', () => {
    controller.should.have.ownProperty('config');
    controller.config.should.deepEqual({
      chartId: 'cpuChart',
      units: '%'
    });
  });

  it('should have a refresh property', () => {
    controller.should.have.ownProperty('refresh');
    controller.refresh.should.equal('interval-sentinel');
  });

  describe('interval', () => {
    it('should call service.getCpuInfo', () => {
      let func = interval.args[0][0];
      func.should.be.a.Function();
      service.getCpuInfo.should.be.calledOnce(); // on initial load
      func();
      service.getCpuInfo.should.be.calledTwice();
      service.getCpuInfo.should.be.calledWith(scope.systemId);
    });

    it('should be every 2 seconds', () => {
      interval.should.be.calledWith(sinon.match.func, sinon.match(2000));
    });

    describe('action', () => {
      it('should resolve data', () => {
        interval.args[0][0]();
        service.cpuPromise.should.be.called();
        let func = service.cpuPromise.args[0][0];
        func.should.be.a.Function();
        let mockData = {
          data: {
            response: {
              percent: 80
            }
          }
        };
        func(mockData);
        controller.data.should.deepEqual({
          used: mockData.data.response.percent,
          total: 100
        });
      });
    });
  });

  describe('on destroy', () => {
    it('should set an ondestroy handler', () => {
      scope.$on.should.be.calledWith('$destroy', sinon.match.func);
    });

    it('should cancel refresh', () => {
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh undefined', () => {
      controller.refresh = undefined;
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.not.be.called();
    });
  });

});
