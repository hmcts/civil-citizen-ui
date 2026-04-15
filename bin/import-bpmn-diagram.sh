#!/usr/bin/env bash

set -eu
workspace=${1}

serviceToken=$($(realpath ".")/bin/shared/idam-lease-service-token.sh civil_service \
  $(docker run --rm hmctsprod.azurecr.io/imported/toolbelt/oathtool --totp -b ${S2S_SECRET:-AABBCCDDEEFFGGHH}))
filepath="$(realpath $workspace)/camunda"

failed=0

for file in $(find ${filepath} -name '*.bpmn')
do
  echo "Uploading BPMN: $(basename ${file})"
  uploadResponse=$(curl --insecure --silent -w "\n%{http_code}" --show-error -X POST \
    ${CAMUNDA_BASE_URL:-http://localhost:9404}/engine-rest/deployment/create \
    -H "Accept: application/json" \
    -H "ServiceAuthorization: Bearer ${serviceToken}" \
    -F "deployment-name=$(date +"%Y%m%d-%H%M%S")-$(basename ${file})" \
    -F "tenant-id=civil" \
    -F "file=@${filepath}/$(basename ${file})")

  upload_http_code=$(echo "$uploadResponse" | tail -n1)
  upload_response_content=$(echo "$uploadResponse" | sed '$d')

  if [[ "${upload_http_code}" == '200' ]]; then
    echo "$(basename ${file}) uploaded successfully"
    continue
  fi

  echo "ERROR: $(basename ${file}) upload failed with HTTP ${upload_http_code}: ${upload_response_content}"
  failed=$((failed + 1))

done

if [[ ${failed} -gt 0 ]]; then
  echo "ERROR: ${failed} BPMN file(s) failed to upload to Camunda"
  exit 1
fi

exit 0
