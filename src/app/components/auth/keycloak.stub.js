var errorSpy = sinon.spy();
var successSpy = sinon.stub().yields().returns({error: errorSpy});
var initSpy = sinon.stub().returns({success: successSpy});
var keycloakProvider = sinon.stub().returns({init: initSpy});

window.Keycloak = keycloakProvider;
