describe('Basic web-client launch', function () {
  it('should successfully load', done => {
    browser.get(browser.params.webClientUrl);
    browser.waitForAngular().then(() => done());
  });

  it('should set page title', () => {
    browser.get(browser.params.webClientUrl);
    browser.getTitle().should.eventually.equal('Thermostat');
  });
});
