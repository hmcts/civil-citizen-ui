#!/bin/bash

set -ex
PIDS=()
HAS_FAILURE=0

if [[ -z "$A11Y_CHUNKS" || ! "$A11Y_CHUNKS" =~ ^[0-9]+$ || "$A11Y_CHUNKS" -le 0 ]]; then
  echo "Error: A11Y_CHUNKS must be a positive integer."
  exit 1
fi

pids=()
for i in $(seq 0 $((A11Y_CHUNKS - 1))); do
  A11Y_CHUNKS_INDEX=$i yarn tests:a11y --reporter-options reportFilename=a11y-$((i + 1)) &
  pids+=($!)
done


# Wait for all jobs and check exit codes
exit_code=0
for pid in "${pids[@]}"; do
  wait "$pid" || exit_code=1
done

if [[ $exit_code -ne 0 ]]; then
  echo "One or more accessibility tests failed."
  HAS_FAILURE=1
fi

echo $HAS_FAILURE > a11y_failures.boolean
echo "All accessibility tests completed successfully."
