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

import controllerModule from './byteman-rules.controller.js';

describe('BytemanController', () => {

  let ctrl, stateParams, translate, svc;
  beforeEach(() => {
    angular.mock.module(controllerModule);

    stateParams = {
      jvmId: 'foo-jvmId',
      systemId: 'foo-systemId'
    };

    translate = sinon.stub();
    translate.withArgs('byteman.rules.COMMAND_CHANNEL_REQUEST_FAILED_TITLE').returns({
      then: sinon.stub().yields('Request Failed')
    });
    translate.then = sinon.stub();
    translate.returns({ then: translate.then });

    svc = {
      getLoadedRules: sinon.stub(),
      loadRule: sinon.stub(),
      unloadRules: sinon.stub(),
      getJvmMainClass: sinon.stub()
    };

    angular.mock.inject($controller => {
      'ngInject';
      ctrl = $controller('BytemanRulesController', {
        $stateParams: stateParams,
        $translate: translate,
        bytemanService: svc
      });
    });
  });

  describe('$onInit ()', () => {
    it('should set error message title', () => {
      ctrl.errTitle.should.equal('Request Failed');
    });

    it('should load injected rules', () => {
      svc.getLoadedRules.should.not.be.called();
      svc.getLoadedRules.returns({
        then: sinon.stub().yields('fake rule')
      });

      ctrl.$onInit();

      svc.getLoadedRules.should.be.calledOnce();
      svc.getLoadedRules.should.be.calledWith(stateParams.jvmId);
      ctrl.loadedRule.should.equal('fake rule');
    });
  });

  describe('refresh ()', () => {
    it('should load injected rules', () => {
      svc.getLoadedRules.should.not.be.called();
      svc.getLoadedRules.returns({
        then: sinon.stub().yields('fake rule')
      });

      ctrl.refresh();

      svc.getLoadedRules.should.be.calledOnce();
      svc.getLoadedRules.should.be.calledWith(stateParams.jvmId);
      ctrl.loadedRule.should.equal('fake rule');
    });
  });

  describe('unload ()', () => {
    it('should do nothing if no loaded rule', () => {
      svc.unloadRules.should.not.be.called();
      ctrl.unload();
      svc.unloadRules.should.not.be.called();
    });

    it('should unload rules', () => {
      svc.getLoadedRules.should.not.be.called();
      svc.getLoadedRules.returns({
        then: sinon.stub().yields('fake rule')
      });
      ctrl.refresh();

      svc.getLoadedRules.returns({
        then: sinon.stub().yields('')
      });
      svc.unloadRules.returns({
        then: sinon.stub().yields({
          status: true,
          reason: ''
        }).returns({
          finally: sinon.stub().yields()
        })
      });
      ctrl.unload();
      ctrl.loadedRule.should.equal('');
    });

    it('should set error flag if request succeeds with non-OK response', () => {
      svc.getLoadedRules.returns({
        then: sinon.stub().yields('fake rule')
      });
      ctrl.refresh();
      svc.unloadRules.returns({
        then: sinon.stub().yields({
          status: false,
          reason: 'some error message'
        }).returns({
          finally: sinon.stub().yields()
        })
      });

      ctrl.unload();

      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('some error message');
    });

    it('should set error flag if request fails', () => {
      svc.getLoadedRules.returns({
        then: sinon.stub().yields('fake rule')
      });
      ctrl.refresh();
      svc.unloadRules.returns({
        then: sinon.stub().callsArgWith(1, 'some error message').returns({
          finally: sinon.stub().yields()
        })
      });

      ctrl.unload();

      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('some error message');
    });
  });

  describe('push ()', () => {
    it('should send local rule text to service', () => {
      const injectedRule = 'injected rule';
      ctrl.ruleText = injectedRule;
      svc.loadRule.returns({
        then: sinon.stub().yields({
          status: true,
          reason: ''
        }).returns({
          finally: sinon.stub().yields()
        })
      });
      svc.getLoadedRules.returns({
        then: sinon.stub().yields(injectedRule)
      });

      ctrl.push();

      ctrl.showErr.should.be.false();
      svc.loadRule.should.be.calledOnce();
      svc.loadRule.should.be.calledWith(stateParams.systemId, stateParams.jvmId, injectedRule);
      ctrl.loadedRule.should.equal(injectedRule);
    });

    it('should set error flag if request succeeds with non-OK response', () => {
      const injectedRule = 'injected rule';
      ctrl.ruleText = injectedRule;
      svc.loadRule.returns({
        then: sinon.stub().yields({
          status: false,
          reason: 'some error message'
        }).returns({
          finally: sinon.stub().yields()
        })
      });
      svc.getLoadedRules.returns({
        then: sinon.stub().yields(injectedRule)
      });

      ctrl.push();

      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('some error message');
      svc.loadRule.should.be.calledOnce();
      svc.loadRule.should.be.calledWith(stateParams.systemId, stateParams.jvmId, injectedRule);
      ctrl.loadedRule.should.equal(injectedRule);
    });

    it('should set error flag if request fails', () => {
      const injectedRule = 'injected rule';
      ctrl.ruleText = injectedRule;
      svc.loadRule.returns({
        then: sinon.stub().callsArgWith(1, 'some error message').returns({
          finally: sinon.stub().yields()
        })
      });
      svc.getLoadedRules.returns({
        then: sinon.stub().yields(injectedRule)
      });

      ctrl.push();

      ctrl.showErr.should.be.true();
      ctrl.errMessage.should.equal('some error message');
      svc.loadRule.should.be.calledOnce();
      svc.loadRule.should.be.calledWith(stateParams.systemId, stateParams.jvmId, injectedRule);
      ctrl.loadedRule.should.equal(injectedRule);
    });
  });

  describe('pull ()', () => {
    it('should pull injected rule into editor', () => {
      const loadedRule = 'loaded rule';
      svc.getLoadedRules.returns({
        then: sinon.stub().yields(loadedRule)
      });

      ctrl.pull();

      svc.getLoadedRules.should.be.calledOnce();
      svc.getLoadedRules.should.be.calledWith(stateParams.jvmId);

      ctrl.loadedRule.should.equal(loadedRule);
      ctrl.ruleText.should.equal(loadedRule);
    });

    it('should not clobber rule text if no remotely injected rules', () => {
      svc.getLoadedRules.returns({
        then: sinon.stub().yields()
      });

      ctrl.ruleText = 'locally edited rule';
      ctrl.pull();

      svc.getLoadedRules.should.be.calledOnce();
      svc.getLoadedRules.should.be.calledWith(stateParams.jvmId);

      should(ctrl.loadedRule).be.undefined();
      ctrl.ruleText.should.equal('locally edited rule');
    });
  });

  describe('generateTemplate ()', () => {
    it('should set rule text to template', () => {
      svc.getJvmMainClass.returns({
        then: sinon.stub().yields('com.example.FooClass')
      });
      translate.then.yields('rule template');
      translate.should.be.calledOnce();
      ctrl.generateTemplate();
      translate.should.be.calledTwice();
      translate.secondCall.should.be.calledWith('byteman.rules.RULE_TEMPLATE', { mainClass: 'com.example.FooClass' });
      ctrl.ruleText.should.equal('rule template');
    });
  });

});
