const { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } = require('fs');
const { tmpdir } = require('os');
const { join, resolve } = require('path');
const { spawnSync } = require('child_process');
const { clean, validate } = require('./artifacts');
const inventory = require('./interaction-inventory.json');

let directory;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'cui-pact-'));
  for (const [provider, interactions] of Object.entries(inventory)) {
    writeFileSync(join(directory, `civil_citizen_ui-${provider}.json`), JSON.stringify({
      consumer: { name: 'civil_citizen_ui' }, provider: { name: provider },
      metadata: { pactSpecification: { version: provider === 'civil_service' ? '4.0' : '2.0.0' } },
      interactions: interactions.map(item => ({ description: item.description, providerState: item.state })),
    }));
  }
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

test('accepts the complete union across consumer suites', () => {
  expect(validate(directory)).toHaveLength(3);
});

test.each(['2.0.0', '3.0.0'])('rejects a Civil Service artifact downgraded to %s', version => {
  const path = join(directory, 'civil_citizen_ui-civil_service.json');
  const pact = JSON.parse(readFileSync(path, 'utf8'));
  pact.metadata.pactSpecification.version = version;
  writeFileSync(path, JSON.stringify(pact));
  expect(() => validate(directory)).toThrow('must use specification V4');
});

test('cleans previous artifacts before generation', () => {
  writeFileSync(join(directory, 'obsolete-provider.json'), '{}');
  clean(directory);
  expect(require('fs').readdirSync(directory)).toEqual([]);
});

test('rejects parallel execution before cleaning artifacts', () => {
  expect(() => require('./setup')({ maxWorkers: 2 })).toThrow('Pact suites share artifacts');
});

test('rejects a valid Pact stored under the wrong provider filename', () => {
  writeFileSync(join(directory, 'civil_citizen_ui-idamApi_oidc.json'),
    readFileSync(join(directory, 'civil_citizen_ui-civil_service.json')));
  expect(() => validate(directory)).toThrow('Unexpected Pact participant');
});

test.each(['missing', 'duplicate', 'stale'])('rejects %s interactions', mutation => {
  const path = join(directory, 'civil_citizen_ui-civil_service.json');
  const pact = JSON.parse(readFileSync(path, 'utf8'));
  if (mutation === 'missing') pact.interactions.pop();
  if (mutation === 'duplicate') pact.interactions.push(pact.interactions[0]);
  if (mutation === 'stale') pact.interactions[0].description = 'obsolete interaction';
  writeFileSync(path, JSON.stringify(pact));
  expect(() => validate(directory)).toThrow('Missing, duplicate or stale');
});

function publish(fail, empty = false, branch = 'feature/pact-reliability') {
  if (empty) {
    rmSync(directory, { recursive: true });
    mkdirSync(directory);
  }
  // Replace only broker transport; execute the real entry point in a child process
  // so a logged rejection with exit 0 cannot satisfy this regression.
  const script = `
    require('ts-node/register');
    const artifacts = require('./src/test/contract/artifacts');
    const validate = artifacts.validate;
    artifacts.validate = () => validate(${JSON.stringify(directory)});
    require('@pact-foundation/pact-node').publishPacts = opts => {
      console.log(JSON.stringify(opts));
      return ${fail ? 'Promise.reject(new Error(\'controlled broker failure\'))' : 'Promise.resolve()'};
    };
    require('./src/test/contract/publish/publish.ts');
  `;
  return spawnSync(process.execPath, ['-e', script], {
    cwd: resolve(__dirname, '../../..'), encoding: 'utf8',
    env: { ...process.env, PACT_CONSUMER_VERSION: 'controlled-commit', PACT_BRANCH_NAME: branch },
  });
}

test.each(['feature/pact-reliability', 'master'])('publishes version and branch metadata for %s', branch => {
  const result = publish(false, false, branch);
  expect(result.status).toBe(0);
  const opts = JSON.parse(result.stdout.split('\n').find(line => line.startsWith('{')));
  expect(opts).toMatchObject({ consumerVersion: 'controlled-commit', branch, tags: [branch] });
  expect(opts.pactFilesOrDirs).toHaveLength(3);
}, 30000);

test('publisher exits non-zero when broker publication rejects', () => {
  const result = publish(true);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('controlled broker failure');
}, 30000);

test('publisher exits non-zero for an empty directory before contacting broker', () => {
  const result = publish(false, true);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Incomplete Pact inventory');
  expect(result.stdout).not.toContain('pactFilesOrDirs');
}, 30000);
