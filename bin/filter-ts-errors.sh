#!/bin/bash

set -e

echo "Ensuring full git history is available..."
git remote set-url origin "$(git config --get remote.origin.url)"
git fetch --unshallow || true
git fetch origin master

# Check if origin/master exists
if ! git rev-parse --verify origin/master >/dev/null 2>&1; then
  echo "origin/master not found. Trying to fetch all..."
  git fetch origin
fi

if ! git rev-parse --verify origin/master >/dev/null 2>&1; then
  echo "Still can't find origin/master. Exiting."
  exit 1
fi

echo "Getting changed TypeScript files..."
CHANGED_FILES=$(git diff --name-only origin/master -- '*.ts' '*.tsx')
echo "Changed files:"
echo "$CHANGED_FILES"

echo "Running TypeScript with strictNullChecks..."
TSC_ERRORS=$(yarn tsc --noEmit --strictNullChecks 2>&1 >/dev/null || true)

echo "Filtering errors to changed files..."
MATCHED_ERRORS=""
MATCH_COUNT=0

IFS=$'\n' read -rd '' -a FILE_ARRAY <<<"$CHANGED_FILES"

while IFS= read -r error_line; do
  for file in "${FILE_ARRAY[@]}"; do
    filename=$(basename "$file")
    if echo "$error_line" | grep -q "$file" || echo "$error_line" | grep -q "$filename"; then
      MATCHED_ERRORS="${MATCHED_ERRORS}\n${error_line}"
      MATCH_COUNT=$((MATCH_COUNT + 1))
      break
    fi
  done
done <<< "$TSC_ERRORS"

echo "Total matched errors: $MATCH_COUNT"
if [ "$MATCH_COUNT" -gt 0 ]; then
  echo -e "$MATCHED_ERRORS"
  exit 1
else
  echo "No TypeScript errors in changed files."
fi
