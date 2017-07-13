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

import filtersModule from 'shared/filters/filters.module.js';
import servicesModule from 'shared/services/services.module.js';

describe('formatBytesFilter', () => {

  let fn, mockSvc;
  beforeEach(() => {
    mockSvc = {
      format: sinon.stub().returns({
        result: 100,
        scale: 2,
        unit: 'MiB'
      })
    };
    angular.mock.module(filtersModule);
    angular.mock.module(servicesModule, $provide => {
      'ngInject';
      $provide.value('scaleBytesService', mockSvc);
    });
    angular.mock.inject(formatBytesFilter => {
      'ngInject';
      fn = formatBytesFilter;
    });
  });

  it('should exist', () => {
    should.exist(fn);
  });

  it('should convert raw numbers', () => {
    mockSvc.format.should.not.be.called();
    fn(100).should.equal('100 MiB');
    mockSvc.format.should.be.calledOnce();
    mockSvc.format.should.be.calledWithMatch({ $numberLong: '100' });
  });

  it('should delegate when called with $numberLong', () => {
    mockSvc.format.should.not.be.called();
    fn({ $numberLong: '100' }).should.equal('100 MiB');
    mockSvc.format.should.be.calledOnce();
    mockSvc.format.should.be.calledWithMatch({ $numberLong: '100' });
  });

});
