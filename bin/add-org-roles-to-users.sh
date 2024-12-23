#!/usr/bin/env bash

# Setting up existing Users with role assignments
echo ""
echo "Setting up Users with role assignments..."
./bin/utils/organisational-role-assignment.sh "DJ.Amy.Powell@ejudiciary.net" "${JUDGE_PASSWORD}" "PUBLIC" "hmcts-judiciary" '{"jurisdiction":"CIVIL","primaryLocation":"739514"}' "JUDICIAL"
./bin/utils/organisational-role-assignment.sh "DJ.Amy.Powell@ejudiciary.net" "${JUDGE_PASSWORD}" "PUBLIC" "judge" '{"jurisdiction":"CIVIL","primaryLocation":"739514","workTypes":"hearing_work,decision_making_work,applications"}' "JUDICIAL"
./bin/utils/organisational-role-assignment.sh "DJ.Amy.Powell@ejudiciary.net" "${JUDGE_PASSWORD}" "PUBLIC" "hearing-viewer" '{"jurisdiction":"CIVIL","primaryLocation":"739514"}' "JUDICIAL"

./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "hmcts-admin" '{"jurisdiction":"CIVIL","primaryLocation":"20262"}' "ADMIN"
./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "task-supervisor" '{"jurisdiction":"CIVIL","primaryLocation":"20262","workTypes":"routine_work,hearing_work,access_requests"}' "ADMIN"
./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "hmcts-viewer" '{"jurisdiction":"CIVIL","primaryLocation":"20262"}' "ADMIN"
./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "hearing-manager" '{"jurisdiction":"CIVIL","primaryLocation":"20262"}' "ADMIN"
./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "hearing-centre-team-leader" '{"jurisdiction":"CIVIL","primaryLocation":"20262","workTypes":"hearing_work,access_requests,routine_work"}' "ADMIN"
./bin/utils/organisational-role-assignment.sh "hearing_center_admin_reg1@justice.gov.uk" "${CITIZEN_PASSWORD}" "PUBLIC" "hearing-centre-admin" '{"jurisdiction":"CIVIL","primaryLocation":"20262","workTypes":"hearing_work,routine_work,multi_Track_hearing_work,intermediate_Track_hearing_work"}' "ADMIN"
