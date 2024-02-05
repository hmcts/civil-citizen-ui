#!/bin/bash
set -ex

echo "Running Functional tests on ${ENVIRONMENT} env"

if [ ${ENVIRONMENT} == preview ] || [ ${ENVIRONMENT} == demo ]; then
  yarn test:carm
else
  yarn test:cui-r1
fi
