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

function config($stateProvider) {
  'ngInject';

  $stateProvider.state('systemInfo', {
    url: '/system-info/{systemId}',
    templateProvider: $q => {
      'ngInject';
      return $q(resolve =>
        require.ensure([], () => resolve(require('./system-info.html'))
        )
      );
    },
    controller: 'systemInfoController as ctrl',
    resolve: {
      loadSystemInfo: ($q, $ocLazyLoad) => {
        'ngInject';
        return $q(resolve => {
          require.ensure(['./system-info.module.js'], () => {
            let module = require('./system-info.module.js');
            $ocLazyLoad.load({ name: 'systemInfo' });
            resolve(module);
          });
        });
      },
      systemId: $stateParams => {
        'ngInject';
        return $stateParams.systemId;
      }
    }
  });
}

export { config };

export default angular.module('systemInfo.routing',
  [
    'ui.router',
    'ui.bootstrap',
    'oc.lazyLoad',
    'patternfly'
  ]
).config(config);
