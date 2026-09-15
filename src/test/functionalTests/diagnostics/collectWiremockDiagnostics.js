#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { sanitize } = require('./functionalFailureDiagnostics');

const wiremockUrl = process.env.WIREMOCK_URL;
const diagnosticsEnabled = process.env.FUNCTIONAL_WIREMOCK_DIAGNOSTICS === 'true' || Boolean(wiremockUrl);
const outputDir = process.env.WIREMOCK_DIAGNOSTICS_OUTPUT_DIR || 'test-results/functional/wiremock';
const wiremockPayloadKey = /^(?:body|bodyAsBase64|bodyPatterns|jsonBody|base64Body|formParams|formParameters|multipartPatterns|queryParams|queryParameters)$/i;

function sanitizeWiremockUrl(value) {
  return sanitize(value.replace(/([?&][^=&#]+)=([^&#]*)/g, '$1=[REDACTED]'));
}

function sanitizeWiremockPayload(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeWiremockPayload);
  }

  if (value && typeof value === 'object') {
    return sanitize(Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        wiremockPayloadKey.test(key)
          ? '[REDACTED]'
          : /^(?:absoluteUrl|url)$/i.test(key) && typeof nestedValue === 'string'
            ? sanitizeWiremockUrl(nestedValue)
            : sanitizeWiremockPayload(nestedValue),
      ]),
    ));
  }

  return sanitize(value);
}

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${wiremockUrl.replace(/\/$/, '')}${endpoint}`, options);
  return {
    status: response.status,
    body: sanitizeWiremockPayload(await response.json().catch(() => null)),
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
  await writeDiagnostic('all-requests.json', () => fetchJson('/__admin/requests'));
  await writeDiagnostic('near-misses.json', () => fetchJson('/__admin/requests/unmatched/near-misses'));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Failed to collect WireMock diagnostics: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {fetchJson, main, sanitizeWiremockPayload, sanitizeWiremockUrl, writeDiagnostic};
