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

describe('JvmInfoController', () => {

  beforeEach(angular.mock.module('jvmInfo.controller'));

  let scope, state, jvmInfoService, killVmService, ctrl, infoPromise, killPromise;
  beforeEach(inject($controller => {
    'ngInject';

    scope = {
      $watch: sinon.spy()
    };

    state = {
      go: sinon.spy()
    };

    infoPromise = {
      then: sinon.stub()
    };
    jvmInfoService = {
      getJvmInfo: sinon.stub().returns(infoPromise)
    };

    killPromise = {
      then: sinon.stub().returns({ finally: sinon.stub().yields() })
    };
    killVmService = {
      killVm: sinon.stub().returns(killPromise)
    };

    ctrl = $controller('JvmInfoController', {
      $scope: scope,
      $state: state,
      systemId: 'bar-systemId',
      jvmId: 'foo-jvmId',
      jvmInfoService: jvmInfoService,
      killVmService: killVmService
    });
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should call jvmInfoService with systemId:bar-systemId and jvmId:foo-jvmId', () => {
    jvmInfoService.getJvmInfo.should.be.calledWith('bar-systemId', 'foo-jvmId');
  });

  it('should provide infoPromise callbacks', () => {
    infoPromise.then.should.be.called();
    infoPromise.then.args[0].length.should.equal(2);
    infoPromise.then.args[0][0].should.be.a.Function();
    infoPromise.then.args[0][1].should.be.a.Function();
  });

  it('should have an empty jvmInfo property', () => {
    ctrl.should.have.property('jvmInfo');
    ctrl.jvmInfo.should.deepEqual({});
  });

  it('should assign jvmInfo object on infoPromise resolve', () => {
    let expected = 'foo';
    infoPromise.then.args[0][0]({
      data: {
        response: [expected]
      }
    });
    ctrl.jvmInfo.should.equal(expected);
  });

  it('should assign empty jvmInfo on infoPromise reject', () => {
    infoPromise.then.args[0][1]();
    ctrl.jvmInfo.should.deepEqual({});
  });

  it('should set showErr false on initialization', () => {
    ctrl.showErr.should.be.false();
  });

  describe('killVm', () => {
    it('should delegate to killVmService', () => {
      killVmService.killVm.should.not.be.called();
      infoPromise.then.yields({
        data: {
          response: [{
            agentId: 'baz-agentId',
            jvmPid: 'jvmPid'
          }]
        }
      });
      ctrl.update();
      ctrl.killVm();
      killVmService.killVm.should.be.calledWith('bar-systemId', 'baz-agentId', 'foo-jvmId', 'jvmPid');
    });

    it('should hide error on success', () => {
      ctrl.showErr = true;
      ctrl.killVm();
      killPromise.then.should.be.calledOnce();
      killPromise.then.should.be.calledWith(sinon.match.func, sinon.match.func);
      let fn = killPromise.then.args[0][0];
      fn({ status:true });
      ctrl.showErr.should.be.false();
    });

    it('should show error and message if request succeeds with unsuccessful status', () => {
      ctrl.showErr = true;
      ctrl.killVm();
      killPromise.then.should.be.calledOnce();
      killPromise.then.should.be.calledWith(sinon.match.func, sinon.match.func);
      let fn = killPromise.then.args[0][0];
      fn({ status:false, reason:'some reason' });
      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('some reason');
    });

    it('should show error and set message on failure', () => {
      ctrl.showErr = false;
      ctrl.killVm();
      killPromise.then.should.be.calledOnce();
      killPromise.then.should.be.calledWith(sinon.match.func, sinon.match.func);
      let fn = killPromise.then.args[0][1];
      fn('foo error');
      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('foo error');
    });

    it('should update on completion', () => {
      jvmInfoService.getJvmInfo.should.be.calledOnce();
      ctrl.killVm();
      jvmInfoService.getJvmInfo.should.be.calledTwice();
    });
  });

  describe('combobox state navigation', () => {
    it('should register a scope-watcher for comboValue', () => {
      scope.$watch.should.be.calledWith(sinon.match('comboValue'), sinon.match.func);
    });

    it('should go to root jvm-info state on empty selection', () => {
      let func = scope.$watch.args[0][1];
      state.go.should.not.be.called();
      func('', '');
      state.go.should.be.calledWith(sinon.match('jvmInfo'), sinon.match.has('jvmId', 'foo-jvmId'));
    });

    it('should go to specified jvm-info child state on non-empty selection', () => {
      let func = scope.$watch.args[0][1];
      state.go.should.not.be.called();
      func('fooState', '');
      state.go.should.be.calledWith(sinon.match('jvmInfo.fooState'), sinon.match.has('jvmId', 'foo-jvmId'));
    });
  });

});
