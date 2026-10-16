#!/usr/bin/env bash
set -euo pipefail
export WIREMOCK_CLASSPATH="$(pwd)/node_modules/wiremock-standalone/wiremock-standalone.jar"
exec sh charts/civil-citizen-ui/wiremock/start.sh "$@"
