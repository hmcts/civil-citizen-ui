#!/bin/bash

set -ex
PIDS=()
FAILURES=0

if [[ -z "$A11Y_CHUNKS" || ! "$A11Y_CHUNKS" =~ ^[0-9]+$ || "$A11Y_CHUNKS" -le 0 ]]; then
  echo "Error: A11Y_CHUNKS must be a positive integer."
  exit 1
fi
for i in $(seq 0 $((A11Y_CHUNKS - 1))); do
  A11Y_CHUNKS_INDEX=$i yarn tests:a11y --reporter-options reportFilename=a11y-$((i + 1)) &
  PIDS+=($!)  # Save the PID of each background job
done

# Wait for each PID and capture its exit code
for pid in "${PIDS[@]}"; do
  wait "$pid"
  status=$?
  if [ $status -ne 0 ]; then
    echo "Process with PID $pid failed with exit code $status"
    ((FAILURES++))
  fi
done

if [ $FAILURES -ne 0 ]; then
  echo "$FAILURES test chunk(s) failed."
  exit 1
else
  echo "All test chunks completed successfully."
fi
