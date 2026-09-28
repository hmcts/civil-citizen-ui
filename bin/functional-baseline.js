#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'docs/functional-baseline.json');
const normalise = title => title.replace(/@[\w-]+/g, '').replace(/\s+/g, ' ').replace(/\s*:\s*/g, ': ').trim();
const testPath = file => file.replace(/\\/g, '/').replace(/^.*?(?=src\/test\/functionalTests\/tests\/)/, '');
const identity = row => `${row.file}::${row.title}`;

// Load declarations through Codecept/Mocha without executing scenarios or hooks.
function collect(root = repoRoot) {
  root = fs.realpathSync(root);
  process.chdir(root);
  for (const name of ['TEST_URL', 'URL', 'SERVICE_AUTH_PROVIDER_API_BASE_URL', 'CCD_DATA_STORE_URL', 'DM_STORE_URL', 'IDAM_API_URL', 'IDAM_TEST_SUPPORT_API_URL', 'IDAM_WEB_URL', 'CIVIL_SERVICE_URL', 'WA_TASK_MGMT_URL', 'AAC_API_URL']) {
    process.env[name] ||= 'http://localhost';
  }
  delete process.env.PREV_FAILED_TEST_FILES;
  delete process.env.PREV_NOT_EXECUTED_TEST_FILES;
  const Codecept = require('codeceptjs/lib/codecept');
  const config = require('codeceptjs/lib/config').load(root);
  config.plugins = {};
  const runner = new Codecept(config, {});
  runner.init(root);
  runner.loadTests();
  const mocha = require('codeceptjs/lib/container').mocha();
  mocha.files = runner.testFiles;
  mocha.loadFiles();
  const rows = [];
  mocha.suite.eachTest(test => {
    const fullTitle = test.fullTitle();
    rows.push({file: testPath(test.file), title: normalise(fullTitle), tags: [...new Set(fullTitle.match(/@[\w-]+/g) || [])].sort(), skipped: Boolean(test.isPending())});
  });
  return rows.sort((a, b) => identity(a).localeCompare(identity(b)));
}

function selection(rows, pipeline) {
  return rows.filter(row => row.tags.includes(`@civil-citizen-${pipeline}`));
}

function verifySelection(baseline, current) {
  for (const pipeline of ['pr', 'master']) {
    const expected = selection(baseline.scenarios, pipeline);
    const actual = selection(current, pipeline);
    const comparable = rows => rows.map(row => ({id: identity(row), skipped: row.skipped})).sort((a, b) => a.id.localeCompare(b.id));
    assert.equal(new Set(actual.map(identity)).size, actual.length, `${pipeline}: duplicate scenario identities`);
    assert.deepEqual(comparable(actual), comparable(expected), `${pipeline}: selection differs from the pre-epic baseline`);
    const unmigrated = actual.filter(row => !row.skipped && (!row.tags.includes('@thin-full-stack') || row.tags.includes('@mocked-functional')));
    assert.deepEqual(unmigrated.map(identity), [], `${pipeline}: active baseline scenarios have not been migrated`);
  }
}

function reconcile(expected, reports) {
  const observed = [];
  function walk(suite, inheritedFile = '') {
    const file = testPath(suite.file || suite.fullFile || inheritedFile);
    for (const test of suite.tests || []) {
      observed.push({file, title: normalise(test.fullTitle), pass: test.pass, fail: test.fail, skipped: test.pending || test.skipped});
    }
    for (const child of suite.suites || []) walk(child, file);
  }
  for (const report of reports) for (const suite of report.results || []) walk(suite);
  const expectedIds = new Set(expected.map(identity));
  const errors = [];
  for (const row of observed.filter(row => row.pass || row.fail)) {
    if (!expectedIds.has(identity(row))) errors.push(`Unexpected execution: ${identity(row)}`);
  }
  const outcomes = expected.map(row => {
    const matches = observed.filter(test => identity(test) === identity(row));
    const actual = matches[0];
    if (matches.length !== 1) errors.push(`Expected one result, found ${matches.length}: ${identity(row)}`);
    else if (row.skipped ? !actual.skipped : !actual.pass || actual.fail || actual.skipped) errors.push(`Unexpected outcome: ${identity(row)}`);
    return {id: identity(row), status: actual?.fail ? 'failed' : actual?.pass ? 'passed' : actual?.skipped ? 'skipped' : 'missing', preExistingSkip: row.skipped};
  });
  return {selected: expected.length, passed: outcomes.filter(r => r.status === 'passed').length, failed: outcomes.filter(r => r.status === 'failed').length, skipped: outcomes.filter(r => r.status === 'skipped').length, outcomes, errors};
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'snapshot') {
    const rows = collect(args[0]);
    fs.writeFileSync(args[1], JSON.stringify({scenarios: rows.filter(row => row.tags.some(tag => ['@civil-citizen-pr', '@civil-citizen-master'].includes(tag)))}, null, 2) + '\n');
    return;
  }
  const baseline = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (command === 'check') {
    verifySelection(baseline, collect());
    console.log('PR/master selection matches the pre-epic baseline; no active scenarios remain unmigrated.');
    return;
  }
  if (command === 'results') {
    const [pipeline, directory, prefix] = args;
    assert.ok(['pr', 'master'].includes(pipeline), 'Expected pr or master pipeline');
    const files = fs.readdirSync(directory).filter(file => file.startsWith(`${prefix}-`) && file.endsWith('.json'));
    assert.ok(files.length, 'No functional reports found');
    const result = {...reconcile(selection(baseline.scenarios, pipeline), files.map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')))), revision: process.env.GIT_COMMIT, pipeline, mode: process.env.OPTIMISED_FUNCTIONAL_TESTS === 'true' ? 'optimised' : 'standard'};
    fs.writeFileSync(path.join(directory, 'baseline-results.json'), JSON.stringify(result, null, 2) + '\n');
    assert.deepEqual(result.errors, [], 'Functional outcomes do not reconcile with the baseline');
    console.log(`Baseline verified: ${result.selected} selected, ${result.passed} passed, ${result.failed} failed, ${result.skipped} pre-existing skips.`);
    return;
  }
  if (command === 'compare') {
    const [left, right] = args.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
    assert.ok(left.revision && left.revision === right.revision, 'Paired runs must use the same revision');
    assert.deepEqual(new Set([left.mode, right.mode]), new Set(['standard', 'optimised']));
    assert.equal(left.pipeline, right.pipeline);
    for (const result of [left, right]) {
      assert.deepEqual(result.errors, []);
      assert.equal(result.failed, 0);
      assert.equal(result.outcomes.length, result.selected);
    }
    assert.deepEqual(left.outcomes, right.outcomes, 'Paired scenario identities/outcomes differ');
    console.log('Standard and optimised baseline identities and outcomes match on the same revision.');
    return;
  }
  throw new Error('Usage: functional-baseline.js snapshot ROOT OUTPUT | check | results pr|master DIRECTORY PREFIX | compare STANDARD OPTIMISED');
}

if (require.main === module) main();
module.exports = {normalise, identity, selection, verifySelection, reconcile};
