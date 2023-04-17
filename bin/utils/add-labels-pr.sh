#!/bin/bash

# Set your GitHub username and repository name
USER=$(git config --get user.email)
REPO='civil-citizen-ui'

# Set the pull request number and labels
PULL_REQUEST_NUMBER="$1"
LABELS=("enableHelm" "fullDeploy" "pr-values:elasticsearch")
# Set the access token for authentication
TOKEN=<Personal Access Token>

# Make the API request to add labels
RESPONSE=$(curl -s -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/hmcts/${REPO}/issues/${PULL_REQUEST_NUMBER}/labels \
  -d '{"labels":['$(printf '"%s",' "${LABELS[@]}" | sed 's/,$//')']}')

# Print the response
echo "$RESPONSE"
