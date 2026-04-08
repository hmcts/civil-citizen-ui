#!/usr/bin/env bash

# Fetch tokens once and export so ccd-add-role.sh reuses them
export USER_TOKEN=$(./bin/utils/idam-lease-user-token.sh ${CCD_CONFIGURER_IMPORTER_USERNAME:-ccd.docker.default@hmcts.net} ${CCD_CONFIGURER_IMPORTER_PASSWORD:-Password12!})
export SERVICE_TOKEN=$(./bin/utils/idam-lease-service-token.sh ccd_gw $(docker run --rm hmctspublic.azurecr.io/imported/toolbelt/oathtool --totp -b ${CCD_API_GATEWAY_S2S_SECRET:-AAAAAAAAAAAAAAAC}))

# User used during the CCD import and ccd-role creation
roles=("caseworker-civil-solicitor" "caseworker-civil-systemupdate" "caseworker-civil-admin" "caseworker-civil-staff" "caseworker-civil-judge" "caseworker-civil" "caseworker-caa" "caseworker-approver" "prd-admin" "citizen" "judge-profile" "basic-access" "ga-basic-access" "legal-adviser" "GS_profile" "caseworker-ras-validation" "full-access" "admin-access" "civil-administrator-basic" "civil-administrator-standard" "hearing-schedule-access" "APP-SOL-UNSPEC-PROFILE" "APP-SOL-SPEC-PROFILE" "RES-SOL-ONE-UNSPEC-PROFILE" "RES-SOL-ONE-SPEC-PROFILE" "RES-SOL-TWO-UNSPEC-PROFILE" "RES-SOL-TWO-SPEC-PROFILE" "payment-access" "caseflags-admin" "caseflags-viewer" "caseworker-wa-task-configuration" "CITIZEN-CLAIMANT-PROFILE" "CITIZEN-DEFENDANT-PROFILE" "APPLICANT-PROFILE-SPEC" "RESPONDENT-ONE-PROFILE-SPEC" "cui-admin-profile" "cui-nbc-profile" "citizen-profile"  "caseworker-civil-citizen-ui-pcqextractor" "judge" "hearing-centre-admin" "national-business-centre" "hearing-centre-team-leader" "next-hearing-date-admin" "court-officer-order" "nbc-team-leader" "ctsc" "ctsc-team-leader" "tribunal-caseworker" "senior-tribunal-caseworker" "caseworker-civil-doc-removal" "caseworker-civil-system-field-reader" "caseworker-civil-rparobot" "wlu-admin")
for role in "${roles[@]}"
do
  ./bin/utils/ccd-add-role.sh "${role}"
done
