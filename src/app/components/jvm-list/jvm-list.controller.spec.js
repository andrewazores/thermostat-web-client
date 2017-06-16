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

describe('JvmListController', () => {

  beforeEach(angular.mock.module('jvmList.controller'));

  let ctrl, scope, promise, location, timeout, anchorScroll, onloadSpy;
  beforeEach(inject(($q, $rootScope, $controller) => {
    'ngInject';
    scope = $rootScope;
    promise = $q.defer();
    location = {
      hash: () => ''
    };
    timeout = sinon.spy();
    anchorScroll = sinon.spy();

    let jvmListService = {
      getSystems: () => promise.promise
    };
    ctrl = $controller('jvmListController', {
      jvmListService: jvmListService,
      $location: location,
      $timeout: timeout,
      $anchorScroll: anchorScroll
    });
    onloadSpy = sinon.spy(ctrl, 'onload');
  }));

  afterEach(() => {
    onloadSpy.restore();
  });

  it('should exist', () => {
    should.exist(ctrl);
  });

  it('should set a title', () => {
    ctrl.title.should.equal('JVM Listing');
  });

  describe('loadData', () => {
    it('should set JVMs list and systemsOpen when service resolves', done => {
      let data = {
        response: [
          {
            systemId: 'foo'
          },
          {
            systemId: 'bar'
          }
        ]
      };
      promise.resolve({ data: data });
      scope.$apply();
      ctrl.should.have.ownProperty('systems');
      ctrl.systems.should.deepEqual(data.response);
      ctrl.showErr.should.equal(false);
      ctrl.systemsOpen.should.deepEqual({
        foo: false,
        bar: false
      });
      onloadSpy.should.not.be.called();
      done();
    });

    it('should set systemsOpen to true and anchorScroll if corresponding hash provided', done => {
      let data = {
        response: [
          {
            systemId: 'foo'
          },
          {
            systemId: 'bar'
          }
        ]
      };
      location.hash = () => 'foo';
      promise.resolve({ data: data });
      scope.$apply();
      ctrl.systemsOpen.should.deepEqual({
        foo: true,
        bar: false
      });
      onloadSpy.should.be.calledOnce();
      done();
    });

    it('should set systemsOpen to false for multiple results with no hash', done => {
      let data = {
        response: [
          {
            systemId: 'foo'
          },
          {
            systemId: 'bar'
          }
        ]
      };
      promise.resolve({ data: data });
      scope.$apply();
      ctrl.systemsOpen.should.deepEqual({
        foo: false,
        bar: false
      });
      onloadSpy.should.not.be.called();
      done();
    });

    it('should set systemsOpen to true for singleton result', done => {
      let data = {
        response: [
          {
            systemId: 'foo'
          }
        ]
      };
      promise.resolve({ data: data });
      scope.$apply();
      ctrl.systemsOpen.should.deepEqual({
        foo: true
      });
      onloadSpy.should.be.calledOnce();
      done();
    });

    it('should set error flag when service rejects', done => {
      promise.reject();
      scope.$apply();
      ctrl.should.have.ownProperty('showErr');
      ctrl.showErr.should.equal(true);
      done();
    });
  });

  describe('extractClassName', () => {
    it('should return early if class name is bare', () => {
      let val = 'className';
      let res = ctrl.extractClassName(val);
      res.should.equal(val);
    });

    it('should return class name given fully qualified name', () => {
      let val = 'foo.bar.Baz';
      let res = ctrl.extractClassName(val);
      res.should.equal('Baz');
    });
  });

  describe('onload', () => {
    it('should call timeout with argument of anchorScroll', () => {
      timeout.reset();
      ctrl.onload();
      timeout.should.be.calledWith(anchorScroll);
    });
  });

});
