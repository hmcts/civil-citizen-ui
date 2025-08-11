#!/bin/bash

set -e

echo "Fetching changed TypeScript files..."
git fetch origin master
CHANGED_FILES=$(git diff --name-only origin/master -- '*.ts' '*.tsx')
echo "Changed files:"
echo "$CHANGED_FILES"

echo "Running TypeScript with strictNullChecks..."
# Capture errors but suppress normal output
TSC_ERRORS=$(yarn tsc --noEmit --strictNullChecks 2>&1 >/dev/null || true)

echo "Filtering errors to changed files..."
MATCHED_ERRORS=""
MATCH_COUNT=0

# Convert changed files to array
IFS=$'\n' read -rd '' -a FILE_ARRAY <<<"$CHANGED_FILES"

# Loop through each line of TSC output
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
