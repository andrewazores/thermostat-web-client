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

import controllerModule from './system-cpu.controller.js';

describe('SystemCpuController', () => {

  beforeEach(angular.mock.module(controllerModule));

  let service, interval, ctrl;
  beforeEach(inject($controller => {
    'ngInject';

    let cpuPromise = sinon.spy();
    service = {
      cpuPromise: cpuPromise,
      getCpuInfo: sinon.stub().returns({ then: cpuPromise }),
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.stub().returns(interval.sentinel);
    ctrl = $controller('SystemCpuController', {
      systemCpuService: service,
      $interval: interval
    });
    ctrl.systemId = 'foo-systemId';
    ctrl.$onInit();
  }));

  it('should exist', () => {
    should.exist(ctrl);
    should.exist(service);
  });

  it('should set an initial data object', () => {
    ctrl.should.have.ownProperty('data');
    ctrl.data.should.deepEqual({
      used: 0,
      total: 100
    });
  });

  it('should set an initial config object', () => {
    ctrl.should.have.ownProperty('config');
    ctrl.config.should.deepEqual({
      chartId: 'cpuChart',
      units: '%'
    });
  });

  it('should have a refresh property', () => {
    ctrl.should.have.ownProperty('_refresh');
    ctrl._refresh.should.equal('interval-sentinel');
  });

  describe('interval', () => {
    it('should call service.getCpuInfo', () => {
      service.getCpuInfo.should.be.calledOnce();
      let func = interval.args[0][0];
      func.should.be.a.Function();
      func();
      service.getCpuInfo.should.be.calledTwice();
      service.getCpuInfo.should.be.calledWith(ctrl.systemId);
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
            response: [{
              perProcessorUsage: [80]
            }]
          }
        };
        func(mockData);
        ctrl.data.should.deepEqual({
          used: mockData.data.response[0].perProcessorUsage[0],
          total: 100
        });
      });
    });
  });

  describe('on destroy', () => {
    it('should cancel refresh', () => {
      ctrl.$onDestroy();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh undefined', () => {
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

    it('should resolve system-cpu stat', done => {
      service.cpuPromise.should.be.calledOnce();
      let res = ctrl.multichartFn();
      res.then(v => {
        v.should.equal(90);
        done();
      });
      service.cpuPromise.should.be.calledTwice();
      let prom = service.cpuPromise.args[1][0];
      prom({
        data: {
          response: [
            {
              perProcessorUsage: [90]
            }
          ]
        }
      });
    });
  });

});
