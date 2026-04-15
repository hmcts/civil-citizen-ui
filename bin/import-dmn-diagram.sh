#!/usr/bin/env bash

set -eu
workspace=${1}
tenant_id=${2}
product=${3}

s2sSecret=${S2S_SECRET:-AABBCCDDEEFFGGHH}

#if [[ "${env}" == 'prod' ]]; then
#  s2sSecret=${S2S_SECRET_PROD}-
#fi

serviceToken=$($(realpath ".")/bin/shared/idam-lease-service-token.sh civil_service \
  $(docker run --rm hmctsprod.azurecr.io/imported/toolbelt/oathtool --totp -b ${s2sSecret}))

dmnFilepath="$(realpath $workspace)/resources"

failed=0

for file in $(find ${dmnFilepath} -name '*.dmn')
do
  echo "Uploading DMN: $(basename ${file})"
  uploadResponse=$(curl --insecure --silent -w "\n%{http_code}" --show-error -X POST \
    ${CAMUNDA_BASE_URL:-http://localhost:9404}/engine-rest/deployment/create \
    -H "Accept: application/json" \
    -H "ServiceAuthorization: Bearer ${serviceToken}" \
    -F "deployment-name=$(basename ${file})" \
    -F "deploy-changed-only=true" \
    -F "deployment-source=$product" \
    ${tenant_id:+'-F' "tenant-id=$tenant_id"} \
    -F "file=@${dmnFilepath}/$(basename ${file})")

  upload_http_code=$(echo "$uploadResponse" | tail -n1)
  upload_response_content=$(echo "$uploadResponse" | sed '$d')

  if [[ "${upload_http_code}" == '200' ]]; then
    echo "$(basename ${file}) uploaded successfully"
    continue
  fi

  echo "ERROR: $(basename ${file}) upload failed with HTTP ${upload_http_code}: ${upload_response_content}"
  failed=$((failed + 1))

done

bpmnFilepath="$(realpath $workspace)/camunda"
if [ -d ${bpmnFilepath} ]
then
  for file in $(find ${bpmnFilepath} -name '*.bpmn')
  do
    echo "Uploading BPMN: $(basename ${file})"
    uploadResponse=$(curl --insecure --silent -w "\n%{http_code}" --show-error -X POST \
      ${CAMUNDA_BASE_URL:-http://localhost:9404}/engine-rest/deployment/create \
      -H "Accept: application/json" \
      -H "ServiceAuthorization: Bearer ${serviceToken}" \
      -F "deployment-name=$(basename ${file})" \
      -F "deploy-changed-only=true" \
      -F "file=@${bpmnFilepath}/$(basename ${file})")

    upload_http_code=$(echo "$uploadResponse" | tail -n1)
    upload_response_content=$(echo "$uploadResponse" | sed '$d')

    if [[ "${upload_http_code}" == '200' ]]; then
      echo "$(basename ${file}) uploaded successfully"
      continue
    fi

    echo "ERROR: $(basename ${file}) upload failed with HTTP ${upload_http_code}: ${upload_response_content}"
    failed=$((failed + 1))

  done
fi

if [[ ${failed} -gt 0 ]]; then
  echo "ERROR: ${failed} DMN/BPMN file(s) failed to upload to Camunda"
  exit 1
fi

exit 0
