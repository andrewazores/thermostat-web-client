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

  let scope, interval, memSvc, scaleSvc, promise, ctrl, sanitizeSvc;
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
    memSvc = {
      getJvmMemory: sinon.stub().returns(promise)
    };
    scaleSvc = {
      format: sinon.stub().returns({
        scale: 1024 * 1024,
        unit: 'MiB'
      })
    };

    sanitizeSvc = {
      sanitize: sinon.stub().returns('sanitized-mock')
    };

    ctrl = $controller('JvmMemoryController', {
      $stateParams: { jvmId: 'foo-jvmId' },
      $scope: scope,
      $interval: interval,
      jvmMemoryService: memSvc,
      scaleBytesService: scaleSvc,
      sanitizeService: sanitizeSvc
    });

    sinon.spy(ctrl, 'update');
    sinon.spy(ctrl, 'cancel');
  }));

  afterEach(() => {
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
      units: 'B'
    });
  });

  it('should update on init', () => {
    memSvc.getJvmMemory.should.be.calledWith('foo-jvmId');
  });

  it('should initialize refreshRate to \'2000\'', () => {
    ctrl.refreshRate.should.equal('2000');
  });

  it('should reset interval on refreshRate change', () => {
    ctrl.should.have.ownProperty('_refresh');
    ctrl.refreshRate = 1;
    interval.should.be.calledWith(sinon.match.func, sinon.match(1));
    ctrl.should.have.ownProperty('_refresh');
    ctrl._refresh.should.equal('interval-sentinel');
  });

  it('should disable when set refreshRate is called with a non-positive value', () => {
    ctrl.cancel.should.not.be.called();
    ctrl.update.should.not.be.called();

    ctrl.refreshRate = -1;

    ctrl.cancel.should.be.calledOnce();
    ctrl.update.should.not.be.called();
    ctrl.should.not.have.ownProperty('_refresh');
  });

  it('should call controller#update() on refresh', () => {
    ctrl.refreshRate = 1;
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
      ctrl._refresh = 'interval-sentinel';
      let func = scope.$on.args[0][1];
      func();
      interval.cancel.should.be.calledWith('interval-sentinel');
    });

    it('should do nothing if refresh is undefined', () => {
      ctrl._refresh = undefined;
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
              metaspaceMaxCapacity: { $numberLong: '0' },
              metaspaceMinCapacity: { $numberLong: '0' },
              metaspaceCapacity: { $numberLong: (40 * 1024 * 1024).toString() },
              metaspaceUsed: { $numberLong: (20 * 1024 * 1024).toString() },
              generations: [
                {
                  capacity: { $numberLong: (10 * 1024 * 1024).toString() },
                  collector: 'Shenandoah',
                  maxCapacity: { $numberLong: (60 * 1024 * 1024).toString() },
                  name: 'Generation 0',
                  spaces: [
                    {
                      capacity: { $numberLong: (50 * 1024 * 1024).toString() },
                      index: 0,
                      maxCapacity: { $numberLong: (80 * 1024 * 1024).toString() },
                      name: 'Gen 0 Space 0',
                      used: { $numberLong: (30 * 1024 * 1024).toString() }
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      func(data);
    });

    it('should update metaspaceData', () => {
      ctrl.metaspaceData.should.deepEqual({
        used: 20,
        total: 40
      });
      scaleSvc.format.should.be.calledTwice();
      scaleSvc.format.should.be.calledWithMatch({ $numberLong: (20 * 1024 * 1024).toString() });
    });

    it('should add generationData', () => {
      ctrl.generationData.should.deepEqual({
        0: {
          index: 0,
          name: 'Generation 0',
          collector: 'Shenandoah',
          spaces: [
            {
              index: 0,
              used: 30,
              total: 50
            }
          ]
        }
      });
      scaleSvc.format.should.be.calledTwice();
      scaleSvc.format.should.be.calledWithMatch({ $numberLong: (30 * 1024 * 1024).toString() });
    });

    it('should update generationData on repeated calls', () => {
      let generation = data.data.response[0].generations[0];
      let space = generation.spaces[0];
      space.capacity = { $numberLong: (100 * 1024 * 1024).toString() };
      space.used = { $numberLong: (50 * 1024 * 1024).toString() };
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
      scaleSvc.format.callCount.should.equal(4);
      scaleSvc.format.args[0][0].should.deepEqual({ $numberLong: (20 * 1024 * 1024).toString() });
      scaleSvc.format.args[1][0].should.deepEqual({ $numberLong: (30 * 1024 * 1024).toString() });
      scaleSvc.format.args[2][0].should.deepEqual({ $numberLong: (20 * 1024 * 1024).toString() });
      scaleSvc.format.args[3][0].should.deepEqual({ $numberLong: (50 * 1024 * 1024).toString() });
    });
  });

  describe('multichartMetaspace', () => {
    it('should return a promise', () => {
      let res = ctrl.multichartMetaspace();
      res.should.be.a.Promise();
    });

    it('should resolve jvm-memory stat', done => {
      promise.then.should.be.calledOnce();
      let res = ctrl.multichartMetaspace();
      res.then(v => {
        v.should.equal(9001);
        done();
      });
      promise.then.should.be.calledTwice();
      let prom = promise.then.secondCall.args[0];
      prom({
        data: {
          response: [
            {
              metaspaceUsed: { $numberLong: '9001' }
            }
          ]
        }
      });
    });
  });

  describe('multichartSpace', () => {
    it('should return a promise', () => {
      let res = ctrl.multichartSpace(0, 0);
      res.should.be.a.Promise();
    });

    it('should resolve space used stat', done => {
      promise.then.should.be.calledOnce();
      let res = ctrl.multichartSpace(1, 1);
      res.then(v => {
        v.should.equal(400);
        done();
      });
      promise.then.should.be.calledTwice();
      let prom = promise.then.secondCall.args[0];
      prom({
        data: {
          response: [
            {
              generations: [
                {
                  spaces: [
                    {
                      used: 100,
                      total: 150
                    },
                    {
                      used: 200,
                      total: 250
                    }
                  ]
                },
                {
                  spaces: [
                    {
                      used: 300,
                      total: 350
                    },
                    {
                      used: 400,
                      total: 450
                    }
                  ]
                }
              ]
            }
          ]
        }
      });
    });
  });

  it('should delegate sanitization to sanitizeService', () => {
    sanitizeSvc.sanitize.should.not.be.called();
    ctrl.sanitize('foo').should.equal('sanitized-mock');
    sanitizeSvc.sanitize.should.be.calledOnce();
    sanitizeSvc.sanitize.should.be.calledWith('foo');
  });

});
