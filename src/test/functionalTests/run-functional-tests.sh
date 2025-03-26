#!/bin/bash
set -ex

echo "Running Functional tests on ${ENVIRONMENT} env"

if [ "$ENVIRONMENT" = "aat" ] || [ -z "$PR_FT_GROUPS" ]; then
  yarn test:cui-regression
else
  command="yarn test:cui-regression --grep "
  pr_ft_groups=$(echo "$PR_FT_GROUPS" | awk '{print tolower($0)}')
  
  regex_pattern=""

  IFS=',' read -ra ft_groups_array <<< "$pr_ft_groups"

  for ft_group in "${ft_groups_array[@]}"; do
      if [ -n "$regex_pattern" ]; then
          regex_pattern+=" | "
      fi
      regex_pattern+="((?=.*@regression)(?=.*@$ft_group))"
  done

  command+="'$regex_pattern'"
  echo "Executing: $command"
  eval "$command"
fi
