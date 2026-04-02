#!/usr/bin/env bash

branchName=${1:-master}

echo "Pulling wiremock mappings from civil-wiremock-mappings (branch: ${branchName})"

# Clone the central wiremock mappings repo
git clone https://github.com/hmcts/civil-wiremock-mappings.git
cd civil-wiremock-mappings

echo "Switching to ${branchName} branch on civil-wiremock-mappings"
git checkout ${branchName}
cd ..

# Ensure wiremock directory exists
mkdir -p ./wiremock/mappings
mkdir -p ./wiremock/__files

# Copy mappings and __files to local wiremock directory
cp -r ./civil-wiremock-mappings/mappings/* ./wiremock/mappings/
cp -r ./civil-wiremock-mappings/__files/* ./wiremock/__files/

# Copy the load script
cp ./civil-wiremock-mappings/bin/load-wiremock-mappings.sh ./bin/

# Cleanup
rm -rf ./civil-wiremock-mappings

echo "Wiremock mappings pulled successfully"
