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

import filters from 'shared/filters/filters.module.js';
import components from 'shared/components/components.module.js';
import jvmListService from './jvm-list.service.js';
import systemInfoService from 'components/system-info/system-info.service.js';

class JvmListController {
  constructor (jvmListService, systemInfoService, $scope, $location, $timeout, $translate) {
    'ngInject';
    this.jvmListService = jvmListService;
    this.systemInfoService = systemInfoService;
    this.scope = $scope;
    this.location = $location;
    this.timeout = $timeout;
    this.translate = $translate;
    this.systemsOpen = {};

    $scope.pageConfig = { showPaginationControls: false };
    $scope.sortConfig = {};
    $scope.filterConfig = {};
    $scope.listConfig = {
      showSelectBox: false,
      useExpandingRows: true,
      onClick: item => $location.hash(this.changeLocationHash(item))
    };
    $scope.jvmConfig = {
      showSelectBox: false,
      useExpandingRows: false
    };

    // Settings for pfPagination
    $scope.pageNumber = 1;
    $scope.pageSize = 10;

    $scope.emptyStateConfig = {
      icon: 'pficon-warning-triangle-o',
    };
    $translate('jvmList.ERR_TITLE').then(s => $scope.emptyStateConfig.title = s);
    $translate('jvmList.ERR_MESSAGE').then(s => $scope.emptyStateConfig.info = s);

    $location.hash('');
    this.aliveOnly = true;
    let aliveOnlySwitch = angular.element('#aliveOnlyState');
    aliveOnlySwitch.bootstrapSwitch();
    aliveOnlySwitch.on('switchChange.bootstrapSwitch', (event, state) => {
      this.aliveOnly = state;
      this.loadData();
    });

    this.loadData();
    this.constructToolbarSettings();
  }

  /**
   * Given an item, it will append or remove the item from the location
   * hash depending on the result of (systemsOpen[item.systemId])
   * E.g., if systemsOpen[item.systemId] is true, then the item is
   * currently expanded in the pf-list-view, and the URL hash should be
   * appended with the systemId of the item. Subsequently calling
   * changeLocationHash with the same item will toggle it's boolean
   * state in systemsOpen, and the location hash will be rebuilt to
   * include only systems that are currently open.
   * @param {Object} item
   * @param {String || Number} hash
   */
  changeLocationHash (item, hash = this.location.hash()) {
    this.systemsOpen[item.systemId] = !this.systemsOpen[item.systemId];
    if (this.systemsOpen[item.systemId]) {
      if (hash === '') {
        hash = item.hostname;
      } else {
        hash += '+' + item.hostname;
      }
    } else { // rebuild the location hash string
      hash = '';
      for (let index in this.systemsOpen) {
        if (hash === '' && this.systemsOpen[index]) {
          hash = index;
        } else if (this.systemsOpen[index]) {
          hash += '+' + index;
        }
      }
    }
    return hash;
  }

  loadData () {
    this.scope.allItems = [];
    this.scope.items = this.scope.allItems;
    this.jvmListService.getSystems(this.aliveOnly).then(
      resp => {
        this.showErr = false;
        this.systems = resp.data.response;
        for (let i = 0; i < this.systems.length; i++) {
          let system = this.systems[i];
          this.systemsOpen[system.systemId] = false;
          this.systemInfoService.getSystemInfo(system.systemId).then(
            resp => {
              this.scope.allItems.push({
                systemId: system.systemId,
                hostname: resp.data.response[0].hostname,
                jvms: system.jvms,
                timeCreated: resp.data.response[0].timeCreated,
                pageConfig: {
                  pageNumber: 1,
                  pageSize: 5
                }
              });
            }
          );
        }
        if (this.systems.length === 1) {
          this.systemsOpen[this.systems[0].systemId] = true;
        }
        this.scope.pageConfig.numTotalItems = this.scope.allItems.length;
        this.scope.pageConfig.pageSize = this.scope.allItems.length;
        this.scope.pageConfig.pageNumber = 1;
        this.scope.listConfig.itemsAvailable = true;
        this.scope.toolbarConfig.filterConfig.resultsCount = this.systems.length;
      },
      () => {
        this.scope.listConfig.itemsAvailable = false;
        this.scope.pageConfig.pageSize = 0;
        this.scope.pageConfig.pageNumber = 0;
        this.showErr = true;
      }
    );
  }

  constructToolbarSettings () {
    this.scope.filterConfig = {
      fields: [
        {
          id: 'hostname',
          filterType: 'text'
        },
        {
          id: 'jvmName',
          filterType: 'text'
        }
      ],
      resultsCount: this.scope.items.length,
      totalCount: this.scope.allItems.length,
      appliedFilters: [],
      onFilterChange: filters => {
        this.applyFilters(filters);
        this.scope.toolbarConfig.filterConfig.resultsCount = this.scope.items.length;
      }
    };
    this.translate('jvmList.HOSTNAME_TITLE').then(s => this.scope.filterConfig.fields[0].title = s);
    this.translate('jvmList.filterConfig.HOSTNAME_PLACEHOLDER').then(s => this.scope.filterConfig.fields[0].placeholder = s);
    this.translate('jvmList.filterConfig.JVM_NAME_TITLE').then(s => this.scope.filterConfig.fields[1].title = s);
    this.translate('jvmList.filterConfig.JVM_NAME_PLACEHOLDER').then(s => this.scope.filterConfig.fields[1].placeholder = s);

    this.scope.sortConfig = {
      fields: [
        {
          id: 'name',
          sortType: 'alpha'
        },
        {
          id: 'timeCreated',
          sortType: 'numeric'
        },
        {
          id: 'numJvms',
          sortType: 'numeric'
        }
      ],
      onSortChange: () => {
        this.sortItems();
      }
    };
    this.translate('jvmList.HOSTNAME_TITLE').then(s => this.scope.sortConfig.fields[0].title = s);
    this.translate('jvmList.sortConfig.TIME_CREATED_TITLE').then(s => this.scope.sortConfig.fields[1].title = s);
    this.translate('jvmList.sortConfig.NUM_JVMS_TITLE').then(s => this.scope.sortConfig.fields[2].title = s);

    this.scope.toolbarConfig = {
      filterConfig: this.scope.filterConfig,
      sortConfig: this.scope.sortConfig
    };
  }

  /**
   * Starter code for matchesFilter, matchesFilters, applyFilters, and compareFn borrowed
   * from the Angular-PatternFly API at:
   * http://www.patternfly.org/angular-patternfly/#/api/patternfly.toolbars.componenet:pfToolbar
   */
  matchesFilter (item, filter) {
    let match = false;
    let re = new RegExp(filter.value, 'i');
    if (filter.id === 'hostname') {
      match = item.hostname.match(re) !== null;
    } else if (filter.id === 'jvmName') {
      for (let i = 0; i < item.jvms.length; i++) {
        match = (item.jvms[i].mainClass).match(re) !== null;
        if (match) {
          break;
        }
      }
    }
    return match;
  }

  matchesFilters (item, filters) {
    let matches = true;
    filters.forEach(filter => {
      if (!this.matchesFilter(item, filter)) {
        matches = false;
        return false;
      } else {
        return true;
      }
    });
    return matches;
  }

  applyFilters (filters) {
    this.scope.items = [];
    if (filters && filters.length > 0) {
      this.scope.allItems.forEach(item => {
        if (this.matchesFilters(item, filters)) {
          this.scope.items.push(item);
        }
      });
    } else {
      this.scope.items = this.scope.allItems;
    }
  }

  compareFn (item1, item2) {
    let compValue = 0;
    if (this.scope.sortConfig.currentField.id === 'name') {
      compValue = item1.hostname.localeCompare(item2.systemId);
    } else if (this.scope.sortConfig.currentField.id === 'timeCreated') {
      compValue = item1.timeCreated.$numberLong > item2.timeCreated.$numberLong ? 1 : -1;
    } else if (this.scope.sortConfig.currentField.id === 'numJvms') {
      compValue = item1.jvms.length > item2.jvms.length ? 1 : -1;
    }
    if (!this.scope.sortConfig.isAscending) {
      compValue = compValue * -1;
    }
    return compValue;
  }

  sortItems () {
    this.scope.items.sort((item1, item2) => this.compareFn(item1, item2));
  }

}

export default angular
  .module('jvmList.controller', [
    'patternfly',
    'patternfly.toolbars',
    filters,
    components,
    jvmListService,
    systemInfoService
  ])
  .controller('JvmListController', JvmListController)
  .name;
