#!/bin/bash

set -ex

if [[ -z "$A11Y_CHUNKS" || ! "$A11Y_CHUNKS" =~ ^[0-9]+$ || "$A11Y_CHUNKS" -le 0 ]]; then
  echo "Error: A11Y_CHUNKS must be a positive integer."
  exit 1
fi

run_chunk() {
  local chunk_index="$1"
  local report_number=$((chunk_index + 1))

  if A11Y_CHUNKS_INDEX="$chunk_index" yarn tests:a11y \
    --reporter-options "reportFilename=a11y-${report_number}"; then
    return 0
  fi

  echo "Accessibility chunk ${report_number} failed; retrying it once."
  A11Y_CHUNKS_INDEX="$chunk_index" yarn tests:a11y \
    --reporter-options "reportFilename=a11y-${report_number}-retry"
}

pids=()
for i in $(seq 0 $((A11Y_CHUNKS - 1))); do
  run_chunk "$i" &
  pids+=($!)
done


# Wait for all jobs and check exit codes
exit_code=0
for pid in "${pids[@]}"; do
  wait "$pid" || exit_code=1
done

if [[ $exit_code -ne 0 ]]; then
  echo "One or more accessibility tests failed."
  exit $exit_code
fi

echo "All accessibility tests completed successfully."
