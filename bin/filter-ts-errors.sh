#!/bin/bash

set -e

echo "Fetching full history..."
git fetch --all

echo "Finding base commit with master..."

BASE_COMMIT=$(git merge-base HEAD master)


echo "Getting changed TypeScript files..."
CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT" -- '*.ts' '*.tsx')
echo "Changed files:"
echo "$CHANGED_FILES"


echo "Running TypeScript with strictNullChecks..."

TSC_ERRORS=$(yarn tsc --noEmit --strictNullChecks 2>&1 || true)



# Debug: show raw TSC errors
echo "Raw TypeScript errors:"
echo "$TSC_ERRORS"

# Debug: show changed files array
IFS=$'\n' read -rd '' -a FILE_ARRAY <<<"$CHANGED_FILES"
echo "Changed file array:"
for f in "${FILE_ARRAY[@]}"; do
  echo " - $f"
done

MATCHED_ERRORS=""
MATCH_COUNT=0

while IFS= read -r error_line; do
  echo "Checking error line: $error_line"
  for file in "${FILE_ARRAY[@]}"; do
    filename=$(basename "$file")
    if echo "$error_line" | grep -q "$file" || echo "$error_line" | grep -q "$filename"; then
      echo "Matched error for file: $file"
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

