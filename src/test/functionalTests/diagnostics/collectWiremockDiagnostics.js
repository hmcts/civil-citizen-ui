#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sanitize } = require('./functionalFailureDiagnostics');

const wiremockUrl = process.env.WIREMOCK_URL;
const diagnosticsEnabled = process.env.FUNCTIONAL_WIREMOCK_DIAGNOSTICS === 'true' || Boolean(wiremockUrl);
const outputDir = process.env.WIREMOCK_DIAGNOSTICS_OUTPUT_DIR || 'test-results/functional/wiremock';

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${wiremockUrl.replace(/\/$/, '')}${endpoint}`, options);
  return {
    status: response.status,
    body: sanitize(await response.json().catch(() => null)),
  };
}

async function writeDiagnostic(fileName, producer) {
  try {
    const diagnostic = await producer();
    fs.writeFileSync(path.join(outputDir, fileName), `${JSON.stringify(diagnostic, null, 2)}\n`);
    console.log(`WireMock diagnostic written: ${fileName}`);
  } catch (error) {
    fs.writeFileSync(path.join(outputDir, fileName), `${JSON.stringify({
      error: sanitize(error.message),
    }, null, 2)}\n`);
    console.log(`WireMock diagnostic unavailable: ${fileName}. Error: ${error.message}`);
  }
}

async function main() {
  if (!diagnosticsEnabled) {
    console.log('WireMock diagnostics skipped because WIREMOCK_URL is not set.');
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  await writeDiagnostic('unmatched-requests.json', () => fetchJson('/__admin/requests/unmatched'));
  await writeDiagnostic('request-journal.json', () => fetchJson('/__admin/requests'));
  await writeDiagnostic('near-misses.json', () => fetchJson('/__admin/near-misses'));
}

main().catch((error) => {
  console.error(`Failed to collect WireMock diagnostics: ${error.message}`);
  process.exit(1);
});
