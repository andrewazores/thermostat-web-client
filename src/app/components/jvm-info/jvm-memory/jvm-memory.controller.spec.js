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

describe('JvmMemory controller', () => {

  beforeEach(angular.mock.module('jvmMemory.controller'));

  let scope, interval, svc, promise, ctrl;
  beforeEach(inject($controller => {
    'ngInject';

    scope = {
      $on: sinon.spy(),
      $watch: sinon.spy()
    };

    interval = sinon.stub().returns('interval-sentinel');
    interval.cancel = sinon.spy();

    promise = {
      then: sinon.spy()
    };
    svc = {
      getJvmMemory: sinon.stub().returns(promise)
    };

    ctrl = $controller('jvmMemoryController', {
      jvmId: 'foo-jvmId',
      $scope: scope,
      $interval: interval,
      jvmMemoryService: svc
    });

    sinon.spy(ctrl, 'setRefreshRate');
    sinon.spy(ctrl, 'update');
    sinon.spy(ctrl, 'cancel');
  }));

  afterEach(() => {
    ctrl.setRefreshRate.restore();
    ctrl.update.restore();
    ctrl.cancel.restore();
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should assign an initial metaspaceData object', () => {
    ctrl.should.have.ownProperty('metaspaceData');
    ctrl.metaspaceData.should.deepEqual({
      used: 0,
      total: 0
    });
  });

  it('should assign a metaspaceConfig object', () => {
    ctrl.should.have.ownProperty('metaspaceConfig');
    ctrl.metaspaceConfig.should.deepEqual({
      chartId: 'metaspaceChart',
      units: 'MiB'
    });
  });

  it('should update on init', () => {
    svc.getJvmMemory.should.be.calledWith('foo-jvmId');
  });

  it('should reset interval on refreshRate change', () => {
    ctrl.should.not.have.ownProperty('refresh');
    ctrl.setRefreshRate(1);
    interval.should.be.calledWith(sinon.match.func, sinon.match(1));
    ctrl.should.have.ownProperty('refresh');
    ctrl.refresh.should.equal('interval-sentinel');
  });

  it('should disable when setRefreshRate is called with a non-positive value', () => {
    ctrl.cancel.should.not.be.called();
    ctrl.setRefreshRate.should.not.be.called();
    ctrl.update.should.not.be.called();

    ctrl.setRefreshRate(-1);

    ctrl.cancel.should.be.calledOnce();
    ctrl.setRefreshRate.should.be.calledOnce(); // the call we just made manually
    ctrl.update.should.not.be.called();
    ctrl.should.not.have.ownProperty('refresh');
  });

  it('should call controller#update() on refresh', () => {
    scope.$watch.should.be.calledWith(sinon.match('refreshRate'), sinon.match.func);
    let f = scope.$watch.args[0][1];
    f(1);
    let func = interval.args[0][0];
    let callCount = ctrl.update.callCount;
    func();
    ctrl.update.callCount.should.equal(callCount + 1);
  });

  describe('ondestroy handler', () => {
    it('should exist', () => {
      scope.$on.should.be.calledWith(sinon.match('$destroy'), sinon.match.func);
    });

    it('should cancel refresh', () => {
      ctrl.refresh = 'interval-sentinel';
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh is undefined', () => {
      ctrl.refresh = undefined;
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.not.be.called();
    });
  });

  describe('update', () => {
    let data, func;
    beforeEach(() => {
      func = promise.then.args[0][0];
      data = {
        data: {
          response: [
            {
              agentId: 'foo-agentId',
              jvmId: 'foo-jvmId',
              timeStamp: 100,
              metaspaceMaxCapacity: 0,
              metaspaceMinCapacity: 0,
              metaspaceCapacity: 4096,
              metaspaceUsed: 2048,
              generations: [
                {
                  capacity: 100,
                  collector: 'Shenandoah',
                  maxCapacity: 200,
                  name: 'Generation 0',
                  spaces: [
                    {
                      capacity: 50,
                      index: 0,
                      maxCapacity: 100,
                      name: 'Gen 0 Space 0',
                      used: 20
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
    });

    it('should update metaspaceData', () => {
      func(data);
      ctrl.metaspaceData.should.deepEqual({
        used: 2048,
        total: 4096
      });
    });

    it('should add generationData', () => {
      func(data);
      ctrl.generationData.should.deepEqual({
        0: {
          index: 0,
          name: 'Generation 0',
          collector: 'Shenandoah',
          spaces: [
            {
              index: 0,
              used: 20,
              total: 50
            }
          ]
        }
      });
    });

    it('should update generationData on repeated calls', () => {
      func(data);
      let generation = data.data.response[0].generations[0];
      let space = generation.spaces[0];
      space.capacity = 100;
      space.used = 50;
      func(data);
      ctrl.generationData.should.deepEqual({
        0: {
          index: 0,
          name: 'Generation 0',
          collector: 'Shenandoah',
          spaces: [
            {
              index: 0,
              used: 50,
              total: 100
            }
          ]
        }
      });
    });
  });

});
