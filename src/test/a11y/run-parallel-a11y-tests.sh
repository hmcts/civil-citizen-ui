#!/bin/bash

set -ex

if [[ -z "$A11Y_CHUNKS" || ! "$A11Y_CHUNKS" =~ ^[0-9]+$ || "$A11Y_CHUNKS" -le 0 ]]; then
  echo "Error: A11Y_CHUNKS must be a positive integer."
  exit 1
fi

for i in $(seq 0 $((A11Y_CHUNKS - 1))); do
  A11Y_CHUNKS_INDEX=$i yarn tests:a11y --reporter-options reportFilename=a11y-$((i + 1)) &
done

wait
echo "All accessibility tests completed."