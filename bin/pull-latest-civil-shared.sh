#!/usr/bin/env bash
set -eu

civilServiceRepo="civil-service"
branchName=${1:-master}

echo "Pulling bin/shared from civil-service (branch: ${branchName})"

rm -rf "${civilServiceRepo}"
git clone --depth 1 --branch "${branchName}" \
  https://github.com/hmcts/${civilServiceRepo}.git

# Create bin/shared if it doesn't exist
mkdir -p ./bin/shared

# Copy only the shared scripts
cp -r "./${civilServiceRepo}/bin/shared/"* ./bin/shared/

rm -rf "./${civilServiceRepo}"

echo "bin/shared scripts updated from civil-service"
