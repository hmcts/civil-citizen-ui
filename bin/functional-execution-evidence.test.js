const {test} = require('node:test');
const assert = require('node:assert/strict');
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
test('same baseline reconciles in both modes, preserving existing skips', () => {
  for (const mode of ['standard', 'optimised']) {
    const result = reconcile(manifest, mode, manifest.scenarios.slice(0, 2).map(s => report(s)));
    assert.deepEqual(result.counts, {selected: 3, passed: 2, failed: 0, skipped: 1, missing: 0});
    assert.deepEqual(result.errors, []);
  }
});
test('missing, duplicate, unexpected, wrong bucket and new skips fail reconciliation', () => {
  const good = manifest.scenarios.slice(0, 2).map(s => report(s));
  for (const reports of [good.slice(0, 1), [...good, good[0]], [...good, report(makeScenario('extra', 'residual'))], [good[0], report(manifest.scenarios[1], 'residual')], [report(manifest.scenarios[0], 'residual', 'skipped'), good[1]]]) {
    assert.ok(reconcile(manifest, 'optimised', reports).errors.length);
  }
});
test('reporter grep exclusions do not count as executed tests or baseline skips', () => {
  const reports = manifest.scenarios.slice(0, 2).map(s => report(s));
  reports[0].data.results[0].tests.push({fullTitle: 'other test', state: 'skipped', pending: false, pass: false, fail: false});
  assert.deepEqual(reconcile(manifest, 'optimised', reports).errors, []);
});
