let errorSpy = sinon.spy();
let successSpy = sinon.stub().returns({error: errorSpy});
let initSpy = sinon.stub().returns({success: successSpy});
let keycloakProvider = sinon.stub().returns({init: initSpy});

window.Keycloak = keycloakProvider;
