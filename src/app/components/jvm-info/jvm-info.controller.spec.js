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
 *
 * --------------------------------------------------------------------------------
 * Additional files and licenses
 * --------------------------------------------------------------------------------
 *
 * Thermostat uses Font Awesome by Dave Gandy (http://fontawesome.io) as primary
 * icon resource, distributed under the SIL OFL 1.1 (http://scripts.sil.org/OFL).
 * A copy of the OFL 1.1 license is also included and distributed with Thermostat.
 */

describe('JvmInfoController', () => {

  beforeEach(angular.mock.module('jvmInfo.controller'));

  let svc, ctrl, promise;
  beforeEach(inject($controller => {
    'ngInject';

    promise = {
      then: sinon.spy()
    };
    svc = {
      getJvmInfo: sinon.stub().returns(promise)
    };

    ctrl = $controller('jvmInfoController', {
      jvmId: 'foo-jvmId',
      jvmInfoService: svc
    });
  }));

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should call jvmInfoService with jvmId foo-jvmId', () => {
    svc.getJvmInfo.should.be.calledWith('foo-jvmId');
  });

  it('should provide promise callbacks', () => {
    promise.then.should.be.called();
    promise.then.args[0].length.should.equal(2);
    promise.then.args[0][0].should.be.a.Function();
    promise.then.args[0][1].should.be.a.Function();
  });

  it('should have an empty jvmInfo property', () => {
    ctrl.should.have.property('jvmInfo');
    ctrl.jvmInfo.should.deepEqual({});
  });

  it('should assign jvmInfo object on promise resolve', () => {
    let expected = ['foo', 'bar'];
    promise.then.args[0][0]({
      data: {
        response: expected
      }
    });
    ctrl.jvmInfo.should.equal(expected);
  });

  it('should assign empty jvmInfo on promise reject', () => {
    promise.then.args[0][1]();
    ctrl.jvmInfo.should.deepEqual({});
  });

});
