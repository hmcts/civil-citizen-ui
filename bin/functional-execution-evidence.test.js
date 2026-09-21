const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const yaml = require('js-yaml');
const {patterns, reconcile} = require('./functional-execution-evidence');

const makeScenario = (name, bucket, skipped = false) => {
  const title = `Feature @baseline: ${name}`;
  return {id: `src/test/a.js::${title}`, file: 'src/test/a.js', title, bucket, skipped};
};
const manifest = {revision: 'same-revision', base: '@baseline', patterns: patterns('@baseline'),
  scenarios: [makeScenario('real', 'residual'), makeScenario('mock @mocked-functional', 'mocked'), makeScenario('disabled', 'residual', true)]};
const report = (scenario, bucket = scenario.bucket, state = 'passed') => ({bucket, data: {results: [{file: '/src/test/a.js', tests: [
  {fullTitle: scenario.title, state, pass: state === 'passed', fail: state === 'failed', pending: state === 'skipped'},
]}]}});

test('routing partitions baseline and rejects conflicting routing tags', () => {
  const p = patterns('@baseline');
  for (const [title, expected] of [['@baseline', ['residual']], ['@baseline @thin-full-stack', ['thin-client']], ['@baseline @mocked-functional', ['mocked']], ['@baseline @mocked-functional @thin-full-stack', []], ['@other', []]]) {
    assert.deepEqual(Object.keys(p).filter(k => new RegExp(p[k]).test(title)), expected);
  }
});
test('standard executes the baseline and optimised executes only migrated scenarios', () => {
  const standard = reconcile(manifest, 'standard', manifest.scenarios.slice(0, 2).map(s => report(s)));
  assert.deepEqual(standard.counts, {selected: 3, passed: 2, failed: 0, skipped: 1, missing: 0, excluded: 0});
  assert.deepEqual(standard.errors, []);

  const optimised = reconcile(manifest, 'optimised', [report(manifest.scenarios[1])]);
  assert.deepEqual(optimised.counts, {selected: 3, passed: 1, failed: 0, skipped: 0, missing: 0, excluded: 2});
  assert.deepEqual(optimised.errors, []);
});
test('missing, duplicate, unexpected, wrong bucket and new skips fail reconciliation', () => {
  const good = [report(manifest.scenarios[1])];
  for (const reports of [[], [...good, good[0]], [...good, report(makeScenario('extra', 'residual'))], [report(manifest.scenarios[1], 'residual')], [...good, report(manifest.scenarios[0])]]) {
    assert.ok(reconcile(manifest, 'optimised', reports).errors.length);
  }
});
test('reporter grep exclusions do not count as executed tests or baseline skips', () => {
  const reports = [report(manifest.scenarios[1])];
  reports[0].data.results[0].tests.push({fullTitle: 'other test', state: 'skipped', pending: false, pass: false, fail: false});
  assert.deepEqual(reconcile(manifest, 'optimised', reports).errors, []);
});

test('optimised preview keeps thin-client dependencies and removes unused workloads', () => {
  const preview = yaml.load(fs.readFileSync('charts/civil-citizen-ui/values.preview.template.yaml', 'utf8'));
  const optimised = yaml.load(fs.readFileSync('charts/civil-citizen-ui/values.optimisedTests.preview.template.yaml', 'utf8'));
  const retained = ['camunda-bpm', 'ccd', 'idam-pr', 'aac-manage-case-assignment'];
  const removed = ['xui-webapp', 'em-stitching', 'em-ccdorc', 'ccd-case-document-am-api'];

  assert.equal(preview['civil-service'].enabled, true);
  retained.forEach(component => {
    assert.equal(preview['civil-service'][component].enabled, true, `${component} must be present in preview`);
    assert.notEqual(optimised['civil-service'][component]?.enabled, false, `${component} must not be disabled by optimisation`);
  });
  removed.forEach(component => {
    assert.equal(preview['civil-service'][component].enabled, true, `${component} must be removed explicitly`);
    assert.equal(optimised['civil-service'][component].enabled, false, `${component} must be disabled`);
  });
  assert.deepEqual(
    optimised['civil-service'].ccd.postgresql.setup.databases.map(database => database.name),
    [
      'pr-${CHANGE_ID}-cmc',
      'pr-${CHANGE_ID}-data-store',
      'pr-${CHANGE_ID}-definition-store',
      'pr-${CHANGE_ID}-camunda',
      'pr-${CHANGE_ID}-role-assignment',
    ],
  );
  assert.equal(optimised.wiremock.enabled, true);
});
