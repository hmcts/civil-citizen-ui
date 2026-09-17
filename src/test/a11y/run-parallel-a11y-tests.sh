#!/bin/bash

set -ex

if [[ -z "$A11Y_CHUNKS" || ! "$A11Y_CHUNKS" =~ ^[0-9]+$ || "$A11Y_CHUNKS" -le 0 ]]; then
  echo "Error: A11Y_CHUNKS must be a positive integer."
  exit 1
fi

# Jenkins may run this stage on an agent without Puppeteer's cached Chrome.
yarn puppeteer browsers install chrome

run_chunk() {
  local chunk_index="$1"
  local report_number=$((chunk_index + 1))

  A11Y_CHUNKS_INDEX="$chunk_index" yarn tests:a11y \
    --reporter-options "reportFilename=a11y-${report_number}"
}

pids=()
chunk_indexes=()
for i in $(seq 0 $((A11Y_CHUNKS - 1))); do
  run_chunk "$i" &
  pids+=($!)
  chunk_indexes+=("$i")
done

# Wait for every parallel worker before retrying failures. Retrying inside a
# worker leaves the other Chrome processes running and preserves the resource
# pressure that caused an intermittent worker failure.
exit_code=0
failed_chunks=()
for array_index in "${!pids[@]}"; do
  if ! wait "${pids[$array_index]}"; then
    failed_chunks+=("${chunk_indexes[$array_index]}")
  fi
done

for chunk_index in "${failed_chunks[@]}"; do
  report_number=$((chunk_index + 1))
  echo "Accessibility chunk ${report_number} failed; retrying it once after all parallel workers completed."
  A11Y_CHUNKS_INDEX="$chunk_index" yarn tests:a11y \
    --reporter-options "reportFilename=a11y-${report_number}-retry" || exit_code=1
done

if [[ "$exit_code" -ne 0 ]]; then
  echo "One or more accessibility tests failed twice."
  exit "$exit_code"
fi

echo "All accessibility tests completed successfully."
