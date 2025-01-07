#!/bin/bash
set -ex

echo "Running Functional tests on ${ENVIRONMENT} env"

yarn test:cui-regression

