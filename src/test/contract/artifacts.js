const { readdirSync, readFileSync, rmSync, mkdirSync } = require('fs');
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
    const actualKeys = pact.interactions.map(key).sort();
    const expectedKeys = expected.map(item => key({ description: item.description, providerState: item.state })).sort();
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      throw new Error(`Missing, duplicate or stale interactions in ${file}`);
    }
  }
  return files.map(file => join(path, file));
}

module.exports = { clean, validate, directory };
