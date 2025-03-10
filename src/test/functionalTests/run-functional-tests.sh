#!/bin/bash
set -ex

echo "Running Functional tests on ${ENVIRONMENT} env"

cpu_count=$(nproc)

echo "Number of CPUs available: ${cpu_count}"

yarn test:cui-regression


