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

beforeEach(() => {
  let EC = protractor.ExpectedConditions;

  browser.ignoreSynchronization = true;
  browser.driver.get(browser.params.webClientUrl);

  let username = element(by.id('username'));
  browser.wait(EC.visibilityOf(username), 10000);

  username.sendKeys('client');
  element(by.id('password')).sendKeys('client-pwd');
  element(by.id('kc-login')).click();

  browser.wait(EC.visibilityOf(element(by.id('brandLogoImg')), 10000));

  browser.call(() => {
    browser.ignoreSynchronization = false;
  });
  browser.waitForAngular();
});

afterEach(() => {
  let userMenu = element(by.id('userMenu'));
  browser.isElementPresent(userMenu).then(present => {
    if (present) {
      userMenu.isDisplayed().then(displayed => {
        if (displayed) {
          userMenu.click();
          let logout = element(by.id('logoutButton'));
          browser.isElementPresent(logout).then(present => {
            if (present) {
              logout.isDisplayed().then(displayed => {
                if (displayed) {
                  logout.click();
                }
              });
            }
          });
        }
      });
    }
  });
});
