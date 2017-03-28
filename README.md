# Thermostat Web UI

AngularJS & Patternfly Application: Thermostat UI

## How to use

Two shell scripts are included to help launch or clean this project.

> sh setup.sh

This should take care of gathering/installing the dependencies, creating the distribution folder (& contents), and actually launching the application.

Once the dependencies and packages are locally installed, subsequent launches can be done via:

> grunt server

A script for teardown has also been included, and may useful when wanting a fresh install, or to clean up old files:

> sh teardown.sh

Note that this removes the node modules and bower components, so to restart the project you'll need to run the setup.sh script again.

