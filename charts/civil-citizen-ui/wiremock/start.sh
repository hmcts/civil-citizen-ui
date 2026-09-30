#!/bin/sh
set -eu

# Use the same pinned extension locally and in the preview. Keep downloaded
# binaries outside the checkout and verify them before loading Java code.
extension_dir="${TMPDIR:-/tmp}/cui-wiremock-extensions"
extension_jar="${extension_dir}/wiremock-state-extension-standalone-0.10.1.jar"
checksum='8898a2700ca16f2d235fa42253e3f400cc08117f9190fdfe1686014c31619ae7'
verify_extension() {
  if command -v sha256sum >/dev/null 2>&1; then
    actual=$(sha256sum "${extension_jar}" | cut -d ' ' -f 1)
  else
    actual=$(shasum -a 256 "${extension_jar}" | cut -d ' ' -f 1)
  fi
  [ "${actual}" = "${checksum}" ]
}
mkdir -p "${extension_dir}"
if ! verify_extension 2>/dev/null; then
  download=$(mktemp "${extension_dir}/download.XXXXXX")
  trap 'rm -f "${download}"' EXIT
  curl --fail --silent --show-error --location --retry 3 --max-time 60 \
    'https://repo.maven.apache.org/maven2/org/wiremock/extensions/wiremock-state-extension-standalone/0.10.1/wiremock-state-extension-standalone-0.10.1.jar' \
    --output "${download}"
  mv "${download}" "${extension_jar}"
  verify_extension
fi
exec java -cp "${WIREMOCK_CLASSPATH:-/var/wiremock/lib/*}:${extension_jar}" wiremock.Run "$@"
