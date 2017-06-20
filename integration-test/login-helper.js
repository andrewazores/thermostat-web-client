module.exports = function () {
  var EC = protractor.ExpectedConditions;

  browser.ignoreSynchronization = true;
  browser.driver.get(browser.params.webClientUrl);

  var logout = element(by.id('logoutButton'));
  browser.isElementPresent(logout).then(function (present) {
    if (present) {
      logout.isDisplayed().then(function (displayed) {
        if (displayed) {
          logout.click();
        }
      });
    }
  });

  var username = element(by.id('username'));
  browser.wait(EC.visibilityOf(username), 10000);

  username.sendKeys('test-user');
  element(by.id('password')).sendKeys('test-pass');
  element(by.id('kc-login')).click();

  browser.wait(EC.visibilityOf(element(by.id('brandLogoImg')), 10000));

  browser.call(function () {
    browser.ignoreSynchronization = false;
  });
  browser.waitForAngular();
}
