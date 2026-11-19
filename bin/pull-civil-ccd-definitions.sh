#!/usr/bin/env bash
# Copies the Civil CCD definitions (civil/ and generalapplication/) into ./ccd-definition from whichever
# repo is their source of truth.
#
# The Civil CCD definitions are moving from civil-ccd-definition into civil-service. The file
# ccd-definition/SOURCE_OF_TRUTH in civil-service, at the civil-service ref given, decides:
#   - absent:  they come from civil-ccd-definition at its ref, as before the move.
#   - present: they come from civil-service at its ref, and the civil-ccd-definition ref is not used.
# civil-service's bin/shared/pull-ccd-definitions.sh makes that decision. It is fetched from civil-service
# master on every run, not from the civil-service ref, so a ref from before the script existed still works.
#
# Usage: ./bin/pull-civil-ccd-definitions.sh [civil-ccd-definition ref] [civil-service ref]
#   Both refs take a branch, tag, full commit SHA, or pr-N for the head of pull request N.
#   Both default to master.

set -eu

ccdDefinitionRef="${1:-master}"
civilServiceRef="${2:-master}"
pullScriptUrl="https://raw.githubusercontent.com/hmcts/civil-service/master/bin/shared/pull-ccd-definitions.sh"

pullScript=$(mktemp)
trap 'rm -f "${pullScript}"' EXIT

curl -fsSL --retry 3 "${pullScriptUrl}" -o "${pullScript}"
bash "${pullScript}" "${civilServiceRef}" "${ccdDefinitionRef}" ./ccd-definition
