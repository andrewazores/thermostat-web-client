#!/bin/sh

# installs the dependencies, generates & launches the application

function require() {
    command -v "$1" >/dev/null 2>&1 || { echo >&2 "'$1' executable is required globally but not found"; exit 1; }
}

require grunt
require bower

npm install
bower install
npm install --save-dev grunt
grunt server
