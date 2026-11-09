#!/usr/bin/env bash

set -euo pipefail

readonly repository_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
readonly jenkinsfile="${repository_root}/Jenkinsfile_CNP"
readonly shared_pull_script="${repository_root}/bin/pull-latest-civil-shared.sh"

assert_central_call() {
  local caller=$1 central_script=$2
  grep -Fq "./bin/shared/${central_script}" "${repository_root}/${caller}" || {
    echo "ERROR: ${caller} does not call bin/shared/${central_script}." >&2
    exit 1
  }
}

assert_central_call 'bin/pull-latest-camunda-files.sh' 'import-bpmn-diagram.sh'
assert_central_call 'bin/pull-latest-dmn-files.sh' 'import-dmn-diagram.sh'
assert_central_call 'bin/pull-latest-camunda-wa-files.sh' 'import-wa-bpmn-diagram.sh'

for duplicate in import-bpmn-diagram.sh import-dmn-diagram.sh import-wa-bpmn-diagram.sh; do
  [ ! -e "${repository_root}/bin/${duplicate}" ] || {
    echo "ERROR: duplicated CUI importer still exists: bin/${duplicate}." >&2
    exit 1
  }
done

if grep -R -E 'docker run.+oathtool' \
  "${repository_root}/bin/pull-latest-camunda-files.sh" \
  "${repository_root}/bin/pull-latest-dmn-files.sh" \
  "${repository_root}/bin/pull-latest-camunda-wa-files.sh"; then
  echo 'ERROR: CUI import orchestration must not generate OTPs directly.' >&2
  exit 1
fi

echo 'PASS: CUI import orchestration uses Civil Service shared importers'

grep -Fq 'return "pr-${civilServicePr}"' "${jenkinsfile}" || {
  echo 'ERROR: a Civil Service PR label does not select shared scripts from the same PR.' >&2
  exit 1
}
grep -Fq 'refs/pull/${pr_number}/head' "${shared_pull_script}" || {
  echo 'ERROR: the shared-script downloader cannot resolve Civil Service PR refs.' >&2
  exit 1
}
echo 'PASS: Civil Service PR selection also selects shared scripts from that PR'
