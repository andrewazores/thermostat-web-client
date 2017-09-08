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

import { configFactory } from './multichart-add.directive.js';

describe('MultichartAddDirective', () => {
  let cfg;
  beforeEach(() => {
    cfg = configFactory();
  });

  it('should be restricted to an element or attribute', () => {
    cfg.restrict.should.have.length(2);
    cfg.restrict.should.containEql('E');
    cfg.restrict.should.containEql('A');
  });

  it('should expect a svcName string in scope', () => {
    cfg.scope.should.have.ownProperty('svcName');
    cfg.scope.svcName.should.equal('@');
  });

  it('should expect a getFn expression in scope', () => {
    cfg.scope.should.have.ownProperty('getFn');
    cfg.scope.getFn.should.equal('&');
  });

  it('should use correct template', () => {
    cfg.template.should.equal(require('./multichart-add.html'));
  });

  it('should attach multichartAddController', () => {
    cfg.should.have.ownProperty('controller');
    cfg.controller.should.equal('MultichartAddController');
    cfg.should.have.ownProperty('controllerAs');
    cfg.controllerAs.should.equal('ctrl');
  });
});
