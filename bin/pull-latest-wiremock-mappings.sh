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

# Copy only cui-specific mappings and __files to local wiremock directory
# (civil-citizen-ui only needs the cui/ subdirectory contents)
cp -r ./civil-wiremock-mappings/mappings/cui/* ./wiremock/mappings/
cp -r ./civil-wiremock-mappings/__files/cui/* ./wiremock/__files/

# Cleanup
rm -rf ./civil-wiremock-mappings

echo "Wiremock mappings pulled successfully (cui only)"
