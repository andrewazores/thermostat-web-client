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

// not a 'real' angular module since this is used for bootstrapping Angular to begin with
import {config} from './auth.module.js';

describe('AuthModule', () => {

  describe('#config()', () => {
    it('should be exposed', () => {
      should.exist(config);
      should(config).be.a.Function();
    });

    it('should invoke callback', done => {
      config('testing', done, () => {});
    });

    describe('keycloak environments', () => {

      it('should not use keycloak in testing', () => {
        let keycloakProvider = sinon.spy();
        config('testing', () => {}, keycloakProvider);
        keycloakProvider.should.not.be.called();
      });

      it('should not use keycloak in development', () => {
        let keycloakProvider = sinon.spy();
        config('development', () => {}, keycloakProvider);
        keycloakProvider.should.not.be.called();
      });

      it('should use keycloak in production', () => {
        let errorSpy = sinon.spy();
        let successSpy = sinon.stub().returns({error: errorSpy});
        let initSpy = sinon.stub().returns({success: successSpy});
        let keycloakProvider = sinon.stub().returns({init: initSpy});

        config('production', () => {}, keycloakProvider);

        keycloakProvider.should.be.calledOnce();
        initSpy.should.be.calledWith({onLoad: 'login-required'});
        successSpy.should.be.calledOnce();
        errorSpy.should.be.calledOnce();
      });
    });
  });

});
