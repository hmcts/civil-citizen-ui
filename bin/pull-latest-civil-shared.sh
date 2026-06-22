#!/usr/bin/env bash
# Pulls bin/shared scripts from civil-service using git sparse-checkout.
# This only downloads the bin/shared directory, not the entire repo.
#
# Usage: ./pull-latest-civil-shared.sh [branch]
#   branch: Optional branch/tag name (default: master)

set -eu

REPO_URL="https://github.com/hmcts/civil-service.git"
BRANCH="${1:-master}"
TEMP_DIR=".civil-service-sparse"
TARGET_DIR="bin/shared"

echo "Pulling ${TARGET_DIR} from civil-service (branch: ${BRANCH})"

# Clean up any previous temp directory
rm -rf "${TEMP_DIR}"

# Initialize a new repo with sparse-checkout (only fetches specified paths)
git clone --filter=blob:none --no-checkout --depth 1 --branch "${BRANCH}" \
  "${REPO_URL}" "${TEMP_DIR}"

cd "${TEMP_DIR}"
git sparse-checkout set --no-cone bin/shared
git checkout
cd ..

# Validate source exists
if [ ! -d "${TEMP_DIR}/bin/shared" ]; then
  echo "ERROR: bin/shared not found in civil-service@${BRANCH}"
  rm -rf "${TEMP_DIR}"
  exit 1
fi

# Create target and copy scripts
mkdir -p "${TARGET_DIR}"
cp -r "${TEMP_DIR}/bin/shared/"* "${TARGET_DIR}/"

# Make all scripts executable
find "${TARGET_DIR}" -name "*.sh" -exec chmod +x {} \;

# Clean up
rm -rf "${TEMP_DIR}"

echo "Done: ${TARGET_DIR} synced from civil-service@${BRANCH}"
