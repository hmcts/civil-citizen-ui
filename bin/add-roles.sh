#!/usr/bin/env bash

# User used during the CCD import and ccd-role creation
roles=("caseworker-civil-solicitor" "caseworker-civil-systemupdate" "caseworker-civil-admin" "caseworker-civil-staff" "caseworker-civil-judge" "caseworker-civil" "caseworker-caa" "caseworker-approver" "prd-admin" "citizen" "judge-profile" "basic-access" "legal-adviser" "GS_profile" "caseworker-ras-validation" "full-access" "admin-access")
for role in "${roles[@]}"
do
  ./bin/utils/ccd-add-role.sh "${role}"
done
