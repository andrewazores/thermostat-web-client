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

import directiveModule from './dismissible-error-message.directive.js';
import {dismissibleErrorMessageFunc} from './dismissible-error-message.directive.js';

describe('dismissibleErrorMessage Directive', () => {
  let compiledDirectiveElement;
  beforeEach(angular.mock.module(directiveModule));

  let initDummyModule = () => {
    let compile, rootScope;
    angular.mock.inject(($compile, $rootScope) => {
      'ngInject';
      compile = $compile;
      rootScope = $rootScope;
    });

    rootScope.errTitle = 'foo';
    rootScope.errMessage = 'bar';
    let element = '<dismissible-error-message err-title=errTitle ' +
      'err-message=errMessage> </dismissible-error-message>';

    compiledDirectiveElement = compile(element)(rootScope);
    rootScope.$digest();
  };

  describe('dismissibleErrorMessage Directive.function', () => {
    it('should return a valid object', () => {
      let fnResult = dismissibleErrorMessageFunc();
      fnResult.should.have.ownProperty('template');
      fnResult.should.have.ownProperty('restrict');
      fnResult.should.have.ownProperty('scope');
    });
  });

  describe('dismissibleErrorMessage Directive.content', () => {
    beforeEach(initDummyModule);

    it('should be a valid object', () => {
      should.exist(compiledDirectiveElement);
    });

    it('should insert the correct error title', () => {
      compiledDirectiveElement.html().should.containEql('foo');
    });

    it('should insert the correct error message', () => {
      compiledDirectiveElement.html().should.containEql('bar');
    });
  });
});
