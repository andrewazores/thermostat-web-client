describe('Basic web-client launch', function () {

  beforeEach(require('../login-helper.js'));

  it('should set page title', () => {
    browser.getTitle().should.eventually.equal('Thermostat');
  });

  it('should navigate to landing state', () => {
    browser.getCurrentUrl().should.eventually.containEql('landing');
  });
});
