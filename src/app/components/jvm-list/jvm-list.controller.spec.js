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

  let rootScope, controller, jvmListSvc, systemInfoSvc, promise, location, state, timeout, translate;

  let fooItem = {
    hostname: 'foo',
    systemId: 'foo',
    timeCreated: { $numberLong: '1500000000000' },
    jvms: [{
      mainClass: 'fooClass'
    }]
  };

  let barbazItem = {
    hostname: 'barbaz',
    systemId: 'barbaz',
    timeCreated: { $numberLong: '1400000000000' },
    jvms: [
      {
        mainClass: 'barClass'
      },
      {
        mainClass: 'bazClass'
      }
    ]
  };

  let filters = [
    {
      id: 'hostname',
      title: 'Hostname',
      value: 'foo'
    },
    {
      id: 'jvmName',
      title: 'JVM MainClass Name',
      value: 'fooClass'
    }
  ];

  let generateSortConfig = (ascending, id) => {
    return {
      isAscending: ascending,
      currentField: {
        id: id
      }
    };
  };

  beforeEach(inject(($q, $rootScope, $controller) => {
    'ngInject';
    rootScope = $rootScope;
    sinon.stub(angular, 'element').withArgs('#aliveOnlyState').returns({
      bootstrapSwitch: sinon.spy(),
      on: sinon.spy()
    });
    promise = $q.defer();
    location = {
      hash: sinon.stub().returns('')
    };
    state = {
      go: sinon.spy()
    };
    timeout = sinon.spy();
    translate = sinon.stub().returns({
      then: sinon.stub().yields({})
    });

    jvmListSvc = {
      getSystems: sinon.stub().returns(promise.promise)
    };
    systemInfoSvc = {
      getSystemInfo: sinon.stub().returns(promise.promise)
    };
    controller = $controller('JvmListController', {
      jvmListService: jvmListSvc,
      systemInfoService: systemInfoSvc,
      $location: location,
      $state: state,
      $timeout: timeout,
      $translate: translate
    });
    controller.$onInit();
    sinon.spy(controller, 'applyFilters');
    sinon.spy(controller, 'changeLocationHash');
    sinon.spy(controller, 'compareFn');
    sinon.spy(controller, 'matchesFilter');
    sinon.spy(controller, 'matchesFilters');
    sinon.spy(controller, 'sortItems');
    sinon.spy(controller.items, 'sort');
  }));

  afterEach(() => {
    angular.element.restore();
  });

  it('should exist', () => {
    should.exist(controller);
  });

  describe('listConfig', () => {
    it('should use a fn (changeLocationHash) for onClick attribute', () => {
      let fn = controller.listConfig.onClick;
      fn.should.be.a.Function();
      fn('');
      controller.changeLocationHash.should.be.calledOnce();
    });
  });

  describe('jvmConfig', () => {
    it('should navigate to state on click', () => {
      state.go.should.not.be.called();
      let fn = controller.jvmConfig.onClick;
      fn.should.be.a.Function();
      fn({
        systemId: 'foo-systemId',
        jvmId: 'foo-jvmId'
      });
      state.go.should.be.calledOnce();
      state.go.should.be.calledWith('jvmInfo', sinon.match({ systemId: 'foo-systemId', jvmId: 'foo-jvmId' }));
    });
  });

  describe('changeLocationHash', () => {
    it('should add system hostname to url when opened', () => {
      let prevLocationHash = '';
      controller.systemsOpen[fooItem.systemId] = false;
      let result = controller.changeLocationHash(fooItem, prevLocationHash);
      result.should.equal(fooItem.hostname);
    });

    it('should append system hostname if more than one open', () => {
      let prevLocationHash = 'foo';
      controller.systemsOpen[fooItem.systemId] = true;
      let result = controller.changeLocationHash(barbazItem, prevLocationHash);
      result.should.equal(fooItem.hostname + '+' + barbazItem.hostname);
    });

    it('should rebuild location hashes when list-view rows are closed', () => {
      let prevLocationHash = 'foo+bar+baz';
      controller.systemsOpen.foo = true;
      controller.systemsOpen.bar = true;
      controller.systemsOpen.baz = true;
      let result = controller.changeLocationHash(fooItem, prevLocationHash);
      result.should.equal('bar+baz');
    });

  });

  describe('aliveOnly', () => {
    it('should default to true', () => {
      controller.should.have.ownProperty('aliveOnly');
      controller.aliveOnly.should.equal(true);
    });

    it('should be bound to aliveOnlyState', () => {
      angular.element.should.be.calledWith('#aliveOnlyState');
    });

    it('should set up bootstrap switch', () => {
      angular.element('#aliveOnlyState').bootstrapSwitch.should.be.calledOnce();
    });

    it('should update state on switch event', () => {
      let stateWidget = angular.element('#aliveOnlyState');
      stateWidget.on.should.be.calledOnce();
      stateWidget.on.should.be.calledWith('switchChange.bootstrapSwitch', sinon.match.func);

      jvmListSvc.getSystems.should.be.calledOnce();
      jvmListSvc.getSystems.firstCall.should.be.calledWith(true);
      let fn = stateWidget.on.args[0][1];
      fn(null, false);
      controller.aliveOnly.should.equal(false);
      jvmListSvc.getSystems.should.be.calledTwice();
      jvmListSvc.getSystems.secondCall.should.be.calledWith(false);
      promise.resolve();
    });
  });

  describe('loadData', () => {
    it('should set JVMs list and systemsOpen when service resolves', done => {
      let data = {
        response: [
          {
            systemId: 'foo',
            jvms: []
          },
          {
            systemId: 'bar',
            jvms: []
          }
        ]
      };
      promise.resolve({ data: data });
      rootScope.$apply();
      controller.should.have.ownProperty('systems');
      controller.systems.should.deepEqual(data.response);
      controller.showErr.should.equal(false);
      controller.systemsOpen.should.deepEqual({
        foo: false,
        bar: false
      });
      controller.listConfig.itemsAvailable.should.be.True();
      done();
    });

    it('should set systemsOpen to false for multiple results with no hash', done => {
      let data = {
        response: [
          {
            systemId: 'foo',
            jvms: []
          },
          {
            systemId: 'bar',
            jvms: []
          }
        ]
      };
      promise.resolve({ data: data });
      rootScope.$apply();
      controller.systemsOpen.should.deepEqual({
        foo: false,
        bar: false
      });
      controller.listConfig.itemsAvailable.should.be.True();
      done();
    });

    it('should set systemsOpen to true for singleton result', done => {
      let data = {
        response: [
          {
            systemId: 'foo',
            jvms: []
          }
        ]
      };
      promise.resolve({ data: data });
      rootScope.$apply();
      controller.systemsOpen.should.deepEqual({
        foo: true
      });
      controller.listConfig.itemsAvailable.should.be.True();
      done();
    });

    it('should set error flag when service rejects', done => {
      promise.reject();
      rootScope.$apply();
      controller.should.have.ownProperty('showErr');
      controller.showErr.should.equal(true);
      controller.listConfig.itemsAvailable.should.be.False();
      done();
    });

    it('should append systemId to jvm items', done => {
      let data = {
        response: [
          {
            systemId: 'foo',
            jvms: [{}]
          }
        ]
      };
      promise.resolve({ data: data });
      rootScope.$apply();
      controller.allItems[0].jvms[0].should.have.ownProperty('systemId');
      controller.allItems[0].jvms[0].systemId.should.equal('foo');
      controller.listConfig.itemsAvailable.should.be.True();
      done();
    });
  });

  describe('constructToolbarSettings', () => {
    it('should use a function for filterConfig.onFilterChange', () => {
      controller.items.length = 2;
      let fn = controller.filterConfig.onFilterChange;
      fn.should.be.a.Function();
      let filter = {
        id: 'hostname',
        title: 'Hostname',
        value: 'foobar'
      };
      fn(filter);
      controller.applyFilters.should.be.calledOnce();
      controller.toolbarConfig.filterConfig.resultsCount.should.equal(2);
    });

    it('should use fn sortItems() for sortConfig.onSortChange', () => {
      let fn = controller.sortConfig.onSortChange;
      fn.should.be.a.Function();
      fn();
      controller.sortItems.should.be.calledOnce();
    });
  });

  describe('Filter and Sorting helper functions', () => {
    it('matchesFilter should match hostnames', () => {
      let filter = {
        id: 'hostname',
        title: 'Hostname',
        value: 'foo'
      };

      controller.matchesFilter(fooItem, filter).should.equal(true);

      filter.value = 'bar';
      controller.matchesFilter(fooItem, filter).should.equal(false);

      filter = {
        id: 'jvmName',
        title: 'JVM MainClass Name',
        value: 'fooClass'
      };
      controller.matchesFilter(fooItem, filter).should.equal(true);

      filter.value = 'barClass';
      controller.matchesFilter(fooItem, filter).should.equal(false);
    });

    it('matchesFilter should match JVM mainclass names', () => {
      let filter = {
        id: 'jvmName',
        title: 'JVM MainClass Name',
        value: 'fooClass'
      };
      controller.matchesFilter(fooItem, filter).should.equal(true);

      filter.value = 'barClass';
      controller.matchesFilter(fooItem, filter).should.equal(false);
    });

    it('matchesFilter should return false if an invalid filter is supplied', () => {
      let filter = {
        id: 'fakeId',
        title: 'fakeTitle',
        value: 'fakeValue'
      };
      controller.matchesFilter(fooItem, filter).should.equal(false);
    });

    it('matchesFilters should delegate matching to matchesFilter', () => {
      controller.matchesFilters(fooItem, filters).should.equal(true);
      controller.matchesFilter.should.be.calledTwice();
    });

    it('matchesFilters should be false if at least one filter returns false', () => {
      controller.matchesFilters(barbazItem, filters).should.equal(false);
    });

    it('applyFilters should delegate filtering to matchesFilters', () => {
      controller.allItems = [fooItem, barbazItem];
      controller.applyFilters(filters);
      controller.matchesFilters.should.be.calledTwice();
      controller.items[0].should.equal(controller.allItems[0]);
      controller.items.length.should.equal(1);
    });

    it('sortItems should sort the array using the compareFn', () => {
      controller.sortConfig = generateSortConfig(true, 'hostname');
      controller.items = [fooItem, barbazItem];
      controller.sortItems();
      controller.compareFn.should.be.calledOnce();
    });

    describe('compareFn', () => {
      it('compareFn should compare hostnames', () => {
        controller.sortConfig = generateSortConfig(true, 'name');
        let result = controller.compareFn(fooItem, barbazItem);
        result.should.equal(1);
      });

      it('compareFn should compare by timeCreated', () => {
        controller.sortConfig = generateSortConfig(true, 'timeCreated');
        let result = controller.compareFn(fooItem, barbazItem);
        result.should.equal(1);

        result = controller.compareFn(barbazItem, fooItem);
        result.should.equal(-1);
      });

      it('compareFn should compare by numJvms', () => {
        controller.sortConfig = generateSortConfig(true, 'numJvms');

        let result = controller.compareFn(fooItem, barbazItem);
        result.should.equal(-1);

        result = controller.compareFn(barbazItem, fooItem);
        result.should.equal(1);
      });

      it('compareFn should allow for descending order', () => {
        controller.sortConfig = generateSortConfig(false, 'numJvms');
        controller.sortConfig.currentField.id = 'numJvms';
        let result = controller.compareFn(fooItem, barbazItem);
        result.should.equal(1);

        result = controller.compareFn(barbazItem, fooItem);
        result.should.equal(-1);
      });

      it('compareFn should return 0 if an invalid field id is supplied', () => {
        controller.sortConfig = generateSortConfig(true, 'numJvms');
        controller.sortConfig.currentField.id = 'fakeId';
        let result = controller.compareFn(fooItem, barbazItem);
        result.should.equal(0);
      });
    });
  });

});
