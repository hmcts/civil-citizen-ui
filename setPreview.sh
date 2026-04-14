#!/bin/bash

service=${1}
prNumber=${2}

if [[ ${service} != "service" && ${service} != "citizen-ui" ]]; then
  echo "Supported repos are: service and citizen-ui"
  exit 1
fi

export URL=https://xui-civil-${service}-pr-${prNumber}.preview.platform.hmcts.net
export CCD_DATA_STORE_URL=https://ccd-data-store-api-civil-${service}-pr-${prNumber}.preview.platform.hmcts.net
export SERVICE_AUTH_PROVIDER_API_BASE_URL=http://rpe-service-auth-provider-aat.service.core-compute-aat.internal
export DM_STORE_URL=http://dm-store-aat.service.core-compute-aat.internal
export IDAM_API_URL=https://idam-api.aat.platform.hmcts.net
export IDAM_WEB_URL=https://idam-web-public.aat.platform.hmcts.net
export IDAM_TEST_SUPPORT_API_URL=https://idam-testing-support-api.aat.platform.hmcts.net
if [[ ${service} = 'service' ]]; then
  export CIVIL_SERVICE_URL=https://civil-${service}-pr-${prNumber}.preview.platform.hmcts.net
else
  export CIVIL_SERVICE_URL=https://civil-${service}-pr-${prNumber}-civil-service.preview.platform.hmcts.net
fi
export AAC_API_URL=https://manage-case-assignment-civil-${service}-pr-${prNumber}.preview.platform.hmcts.net
export CIVIL_ORCHESTRATOR_SERVICE_URL=http://civil-orchestrator-service-aat.service.core-compute-aat.internal
export S2S_SECRET=BTZQFPGY4TUMAFGL
export TEST_URL=https://civil-${service}-pr-${prNumber}.preview.platform.hmcts.net
export ENVIRONMENT_NAME=preview
export XUI_S2S_SECRET=43a8f3ebe9944be4878454a0966a5416
export ENVIRONMENT=preview
export NODE_TLS_REJECT_UNAUTHORIZED=0
export SYSTEM_USER_PASSWORD=Password12
export JUDGE_PASSWORD=Hmcts1234
export CITIZEN_PASSWORD=Password12!


