function login () {
  var EC = protractor.ExpectedConditions;

  browser.driver.get(browser.params.webClientUrl);

  var username = element(by.id('username'));
  browser.wait(EC.visibilityOf(username), 5000);

  username.sendKeys('test-user');
  element(by.id('password')).sendKeys('test-pass');
  element(by.id('kc-login')).click();
}

module.exports = login;
