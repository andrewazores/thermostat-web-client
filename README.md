# Thermostat Web UI

AngularJS & Patternfly Application: Thermostat UI

[![Build Status](https://travis-ci.org/andrewazores/thermostat-web-client.svg?branch=master)](https://travis-ci.org/andrewazores/thermostat-web-client)
[![Dependency Status](https://gemnasium.com/badges/github.com/andrewazores/thermostat-web-client.svg)](https://gemnasium.com/github.com/andrewazores/thermostat-web-client)
[![Chat](https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg)](https://webchat.freenode.net/?channels=#thermostat)

## Dependencies:

`npm`, which will pull down all other dependencies.

`keycloak.json` generated by a Keycloak server (if desired, ie, running with
`NODE_ENV=production`), placed in `src/app/components/auth/`. The file contents should
look like:

    {
        "url": "http://some.domain:PORT/auth",
        "realm": "FooRealm",
        "clientId": "BarClientId"
    }

## How to use

Live-reload development:

`npm run devserver`, then point a web browser at localhost:8080.

One-time build:

`npm run build`

Non-live-reload web-server:

`npm start`, then point a web browser at localhost:8080.

In this case, you may run the server on a different port than the default 8080
by setting the environment variable `PORT` to a port number of your choosing.
The server also binds by default on `0.0.0.0`, which can be overridden with the
environment variable `HOST`.

Run tests:

`npm test` (one-time) or `npm run test-watch` (live-reload)
