#!/bin/bash

set -ex

if [[ -z "$CHUNKS" || ! "$CHUNKS" =~ ^[0-9]+$ || "$CHUNKS" -le 0 ]]; then
  echo "Error: CHUNKS must be a positive integer."
  exit 1
fi

COMMANDS=()
for i in $(seq 0 $((CHUNKS - 1))); do
  COMMANDS+=("A11Y_CHUNKS_INDEX=$i yarn tests:a11y --reporter-options reportFilename=a11y-$((i + 1))")
done

yarn concurrently "${COMMANDS[@]}"