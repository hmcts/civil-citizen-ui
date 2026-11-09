const { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync } = require('fs');
const { resolve, join } = require('path');
const inventory = require('./interaction-inventory.json');

const directory = resolve(__dirname, 'pacts');
const key = interaction => JSON.stringify([
  interaction.description,
  interaction.providerState || interaction.providerStates?.[0]?.name || '',
]);

function clean(path = directory) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function canonicalize(path = directory) {
  const stableBoundary = 'cui-contract-boundary';
  const pactFile = join(path, 'civil_citizen_ui-civil_service.json');
  const pact = JSON.parse(readFileSync(pactFile, 'utf8'));
  for (const interaction of pact.interactions) {
    if (interaction.description !== 'a multipart citizen document upload') continue;

    if (!interaction.request) continue; // Minimal synthetic artifacts used by tooling tests.
    const contentType = interaction.request.headers?.['Content-Type']?.[0];
    const boundary = contentType?.match(/(?:^|;)\s*boundary=([^;\s]+)/i)?.[1];
    const body = interaction.request.body;
    if (!boundary || !body || body.encoded !== 'base64') {
      throw new Error('Multipart document upload Pact is missing its encoded body or boundary');
    }

    // Pact's multipart DSL creates a random MIME boundary. The consumer request
    // still uses its real FormData boundary; the header matcher accepts it. Only
    // canonicalize the saved example so one commit always publishes the same Pact.
    const bytes = Buffer.from(body.content, 'base64');
    const normalizedBody = bytes.toString('latin1').split(`--${boundary}`).join(`--${stableBoundary}`);
    body.content = Buffer.from(normalizedBody, 'latin1').toString('base64');
    interaction.request.headers['Content-Type'][0] = contentType.replace(boundary, stableBoundary);
  }
  writeFileSync(pactFile, `${JSON.stringify(pact, null, 2)}\n`);
}

function validate(path = directory) {
  const files = readdirSync(path).filter(file => file.endsWith('.json')).sort();
  const expectedFiles = Object.keys(inventory).map(provider => `civil_citizen_ui-${provider}.json`).sort();
  if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
    throw new Error(`Incomplete Pact inventory: expected ${expectedFiles}; found ${files}`);
  }
  for (const file of files) {
    const pact = JSON.parse(readFileSync(join(path, file), 'utf8'));
    const expected = inventory[pact.provider.name];
    if (pact.consumer.name !== 'civil_citizen_ui' || !expected || file !== `civil_citizen_ui-${pact.provider.name}.json`) {
      throw new Error(`Unexpected Pact participant in ${file}`);
    }
    // V2/V3 cannot reliably preserve JSON scalar strings in the JVM verifier.
    // All Civil Service suites must write the same V4 artifact when merging.
    if (pact.provider.name === 'civil_service' && !pact.metadata?.pactSpecification?.version?.startsWith('4.')) {
      throw new Error('Civil Service Pact must use specification V4 to preserve JSON scalar bodies');
    }
    const actualKeys = pact.interactions.map(key).sort();
    const expectedKeys = expected.map(item => key({ description: item.description, providerState: item.state })).sort();
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      throw new Error(`Missing, duplicate or stale interactions in ${file}`);
    }
  }
  return files.map(file => join(path, file));
}

module.exports = { clean, canonicalize, validate, directory };
