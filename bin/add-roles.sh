#!/usr/bin/env bash

# User used during the CCD import and ccd-role creation
roles=("caseworker-civil-solicitor" "caseworker-civil-systemupdate" "caseworker-civil-admin" "caseworker-civil-staff" "caseworker-civil-judge" "caseworker-civil" "caseworker-caa" "caseworker-approver" "prd-admin" "citizen" "judge-profile" "basic-access" "legal-adviser" "GS_profile" "caseworker-ras-validation" "full-access" "admin-access" "civil-administrator-basic" "civil-administrator-standard" "hearing-schedule-access" "APP-SOL-UNSPEC-PROFILE" "APP-SOL-SPEC-PROFILE" "RES-SOL-ONE-UNSPEC-PROFILE" "RES-SOL-ONE-SPEC-PROFILE" "RES-SOL-TWO-UNSPEC-PROFILE" "RES-SOL-TWO-SPEC-PROFILE" "payment-access" "caseflags-admin" "caseflags-viewer" "caseworker-wa-task-configuration" "CITIZEN-CLAIMANT-PROFILE" "CITIZEN-DEFENDANT-PROFILE" "cui-admin-profile" "cui-nbc-profile" "citizen-profile"  "caseworker-civil-citizen-ui-pcqextractor" "judge" "hearing-centre-admin" "national-business-centre" "hearing-centre-team-leader")
for role in "${roles[@]}"
do
  ./bin/utils/ccd-add-role.sh "${role}"
done
