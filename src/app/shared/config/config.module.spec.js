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

describe('ConfigModule', () => {

  beforeEach(() => {
    angular.mock.module('configModule');
  });

  it('should export CFG_MODULE constant', () => {
    inject(CFG_MODULE => {
      'ngInject';
      should.exist(CFG_MODULE);
    });
  });

  describe('environment', () => {
    let _environment;
    beforeEach(inject(environment => {
      'ngInject';

      _environment = environment;
    }));

    it('should be exported', () => {
      should.exist(_environment);
    });

    it('should be readonly', done => {
      try {
        _environment.foo = 'bar';
      } catch (e) {
        e.message.should.equal('Attempted to assign to readonly property.');
        done();
      }
    });
  });

  describe('debug', () => {
    let _debug;
    beforeEach(inject(debug => {
      'ngInject';

      _debug = debug;
    }));

    it('should be exported', () => {
      should.exist(_debug);
    });

    it('should be readonly', done => {
      try {
        _debug.foo = 'bar';
      } catch (e) {
        e.message.should.equal('Attempted to assign to readonly property.');
        done();
      }
    });
  });

  describe('gatewayUrl', () => {
    let _gatewayUrl;
    beforeEach(inject(gatewayUrl => {
      'ngInject';

      _gatewayUrl = gatewayUrl;
    }));

    it('should be exported', () => {
      should.exist(_gatewayUrl);
    });

    it('should be readonly', done => {
      try {
        _gatewayUrl.foo = 'bar';
      } catch (e) {
        e.message.should.equal('Attempted to assign to readonly property.');
        done();
      }
    });
  });

});
