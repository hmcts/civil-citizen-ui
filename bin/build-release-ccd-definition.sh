#!/bin/bash

set -eu

environment=${1:-prod}
excludeNonProdFiles=${2:-true}

if [ ${environment} == preview ]; then
  excludedFilenamePatterns="-e *-nonprod.json,*LRspec.json"
elif [ ${environment} == demo ]; then
  excludedFilenamePatterns="-e UserProfile.json,*-prod.json"
elif [ ${excludeNonProdFiles} == true ]; then
  excludedFilenamePatterns="-e UserProfile.json,*-nonprod.json,*LRspec.json,*GAspec.json"
else
  excludedFilenamePatterns="-e UserProfile.json,*LRspec.json,*GAspec.json,*-prod.json"
fi

root_dir=$(realpath $(dirname ${0})/..)
config_dir=${root_dir}/ccd-definition
build_dir=${root_dir}/build/ccd-release-config
github_dir=${root_dir}/build/github-release
release_definition_output_file=${build_dir}/civil-ccd-${environment}.xlsx
github_file=${github_dir}/civil-ccd-${environment}.xlsx

mkdir -p ${build_dir}
mkdir -p ${github_dir}

# build the ccd definition file
${root_dir}/bin/utils/process-definition.sh ${config_dir} ${release_definition_output_file} "${excludedFilenamePatterns}"

cp ${release_definition_output_file} ${github_file}
