import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {test} from 'node:test';
import {fetchCoverage, REPOSITORY, selectRun, validateCoverage} from './unit-coverage.mjs';

const sha = 'a'.repeat(40);
const lcov = Buffer.from('TN:\nSF:src/main/example.ts\nDA:1,1\nend_of_record\n');
const manifest = {version: 1, repository: REPOSITORY, commit: sha, runId: '12', runAttempt: '2',
  lcovSha256: createHash('sha256').update(lcov).digest('hex')};
const run = {id: 12, run_attempt: 2, head_sha: sha, event: 'pull_request', status: 'completed', conclusion: 'success',
  path: '.github/workflows/ci.yml', repository: {full_name: REPOSITORY}, pull_requests: [{number: 123}]};

function fixture(body, archiveManifest = manifest) {
  const directory = mkdtempSync(join(tmpdir(), 'hmcts-coverage-test-'));
  try {
    writeFileSync(join(directory, 'lcov.info'), lcov);
    writeFileSync(join(directory, 'unit-coverage.json'), JSON.stringify(archiveManifest));
    execFileSync('zip', ['-q', 'coverage.zip', 'lcov.info', 'unit-coverage.json'], {cwd: directory});
    return body(directory, readFileSync(join(directory, 'coverage.zip')));
  } catch (error) {
    rmSync(directory, {recursive: true, force: true});
    throw error;
  }
}

test('coverage must match the checkout, workflow attempt and report bytes', () => {
  validateCoverage(manifest, lcov, {commit: sha, runId: 12, runAttempt: 2});
  for (const change of [{commit: 'b'.repeat(40)}, {repository: 'another/repo'}, {runId: 13},
    {runAttempt: 1}, {lcovSha256: 'wrong'}, {version: 0}]) {
    assert.throws(() => validateCoverage({...manifest, ...change}, lcov, {commit: sha, runId: 12, runAttempt: 2}));
  }
  assert.throws(() => validateCoverage(manifest, Buffer.from('changed'), {commit: sha}));
  const empty = Buffer.from('not an LCOV report');
  assert.throws(() => validateCoverage({...manifest, lcovSha256: createHash('sha256').update(empty).digest('hex')}, empty, {commit: sha}));
  assert.throws(() => validateCoverage(null, lcov, {commit: sha}));
});

test('only the latest CI run for this PR head in this repository is eligible', () => {
  const wrong = [
    {head_sha: 'b'.repeat(40)}, {event: 'push'}, {path: '.github/workflows/other.yml'},
    {repository: {full_name: 'another/repo'}}, {pull_requests: [{number: 999}]},
  ].map(change => ({...run, id: 99, ...change}));
  assert.equal(selectRun([...wrong, {...run, id: 11}, run], sha, 123), run);
  assert.equal(selectRun(wrong, sha, 123), undefined);
  // Fork PRs still publish runs and artifacts in the base repository.
  const fork = {...run, head_repository: {full_name: 'contributor/fork'}};
  assert.equal(selectRun([fork], sha, 123), fork);
});

test('waits for success, downloads the real archive without forwarding credentials, and preserves LCOV bytes', async () => {
  await fixture(async (directory, archive) => {
    try {
      let polls = 0;
      let sleeps = 0;
      const output = join(directory, 'output');
      await fetchCoverage({sha, pr: 123, token: 'test-only', directory: output, sleep: async () => { sleeps++; },
        fetchImpl: async (url, options) => {
          if (url === 'https://storage.example/coverage.zip') {
            assert.equal(options.headers, undefined);
            return new Response(archive);
          }
          assert.equal(options.headers.Authorization, 'Bearer test-only');
          assert.equal(options.redirect, 'manual');
          if (url.includes('/workflows/')) return Response.json({workflow_runs: [{...run, status: ++polls === 1 ? 'in_progress' : 'completed'}]});
          if (url.endsWith('/artifacts?per_page=100')) return Response.json({artifacts: [{id: 9, name: `unit-coverage-${sha}-2`, expired: false}]});
          assert.ok(url.endsWith('/artifacts/9/zip'));
          return new Response(null, {status: 302, headers: {location: 'https://storage.example/coverage.zip'}});
        }});
      assert.equal(sleeps, 1);
      assert.deepEqual(readFileSync(join(output, 'lcov.info')), lcov);
      assert.deepEqual(JSON.parse(readFileSync(join(output, 'unit-coverage.json'))), manifest);
    } finally {
      rmSync(directory, {recursive: true, force: true});
    }
  });
});

for (const conclusion of ['failure', 'cancelled', 'timed_out']) {
  test(`does not reuse an older success when the latest run is ${conclusion}`, async () => {
    await assert.rejects(fetchCoverage({sha, pr: 123, token: 'test-only', fetchImpl: async () =>
      Response.json({workflow_runs: [{...run, id: 11}, {...run, conclusion}]})}), /finished with/);
  });
}

test('missing or expired artifacts fail rather than silently skipping unit tests', async () => {
  for (const artifacts of [[], [{id: 9, name: `unit-coverage-${sha}-2`, expired: true}]]) {
    await assert.rejects(fetchCoverage({sha, pr: 123, token: 'test-only', fetchImpl: async url =>
      Response.json(url.includes('/workflows/') ? {workflow_runs: [run]} : {artifacts})}), /no current unit coverage artifact/);
  }
});

test('API errors are bounded and do not expose the credential or response body', async () => {
  await assert.rejects(fetchCoverage({sha, pr: 123, token: 'do-not-print', fetchImpl: async () =>
    new Response('do-not-print', {status: 403})}), {message: 'GitHub unit coverage request failed (HTTP 403)'});
});

test('credentials cannot be sent to an insecure artifact redirect', async () => {
  let downloads = 0;
  await assert.rejects(fetchCoverage({sha, pr: 123, token: 'test-only', fetchImpl: async url => {
    if (url.includes('/workflows/')) return Response.json({workflow_runs: [run]});
    if (url.endsWith('/artifacts?per_page=100')) return Response.json({artifacts: [{id: 9, name: `unit-coverage-${sha}-2`}]});
    if (url.endsWith('/zip')) return new Response(null, {status: 302, headers: {location: 'http://storage.example/coverage.zip'}});
    downloads++;
    return new Response('must not be downloaded');
  }}), /secure coverage download/);
  assert.equal(downloads, 0);
});

test('a missing workflow times out without accepting a different commit', async () => {
  let clock = 0;
  await assert.rejects(fetchCoverage({sha, pr: 123, token: 'test-only', timeoutMs: 2,
    now: () => clock, sleep: async () => { clock++; }, fetchImpl: async () =>
      Response.json({workflow_runs: [{...run, head_sha: 'b'.repeat(40)}]})}), /Timed out/);
  assert.equal(clock, 2);
});

test('an archive for a different attempt cannot replace existing coverage', async () => {
  await fixture(async (directory, archive) => {
    try {
      const output = join(directory, 'output');
      mkdirSync(output);
      writeFileSync(join(output, 'lcov.info'), 'existing report');
      await assert.rejects(fetchCoverage({sha, pr: 123, token: 'test-only', directory: output,
        fetchImpl: async url => {
          if (url.includes('/workflows/')) return Response.json({workflow_runs: [run]});
          if (url.endsWith('/artifacts?per_page=100')) return Response.json({artifacts: [{id: 9, name: `unit-coverage-${sha}-2`}]});
          if (url.endsWith('/zip')) return new Response(null, {status: 302, headers: {location: 'https://storage.example/coverage.zip'}});
          return new Response(archive);
        }}), /does not match/);
      assert.equal(readFileSync(join(output, 'lcov.info'), 'utf8'), 'existing report');
    } finally {
      rmSync(directory, {recursive: true, force: true});
    }
  }, {...manifest, runAttempt: 1});
});

function runnerFixture(body) {
  // Stay beneath the real checkout so the CLI's git verification remains real.
  const directory = mkdtempSync(resolve('.unit-coverage-test-'));
  try {
    mkdirSync(join(directory, 'node_modules/jest/bin'), {recursive: true});
    writeFileSync(join(directory, 'node_modules/jest/bin/jest.js'), `
      const fs = require('node:fs');
      fs.writeFileSync('jest-arguments.json', JSON.stringify(process.argv.slice(2)));
      if (process.env.FAIL_TESTS) process.exit(1);
      fs.mkdirSync('coverage', {recursive: true});
      fs.writeFileSync('coverage/lcov.info', ${JSON.stringify(lcov.toString())});
    `);
    return body(directory, (env, args = []) => spawnSync(process.execPath, [resolve('bin/unit-coverage.mjs'), 'run', ...args], {
      cwd: directory, encoding: 'utf8', timeout: 10000,
      env: {PATH: process.env.PATH, ...env},
    }));
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

test('local/master runs execute Jest once and retain the existing coverage flags', () => {
  runnerFixture((directory, invoke) => {
    assert.equal(invoke({}).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(join(directory, 'jest-arguments.json'))), ['--coverage', '--maxWorkers=8', '--silent']);
    assert.equal(existsSync(join(directory, 'coverage/unit-coverage.json')), false);
  });
});

test('Actions publishes a commit-bound manifest only after passing unit tests', () => {
  runnerFixture((directory, invoke) => {
    const env = {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'pull_request', GITHUB_RUN_ID: '12',
      GITHUB_RUN_ATTEMPT: '2', JEST_MAX_WORKERS: '2'};
    assert.equal(invoke(env).status, 0);
    const report = JSON.parse(readFileSync(join(directory, 'coverage/unit-coverage.json')));
    const actualCommit = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
    validateCoverage(report, lcov, {commit: actualCommit, runId: 12, runAttempt: 2});
    assert.ok(JSON.parse(readFileSync(join(directory, 'jest-arguments.json'))).includes('--maxWorkers=2'));
    assert.notEqual(invoke({...env, FAIL_TESTS: 'true'}).status, 0);
    assert.equal(existsSync(join(directory, 'coverage/unit-coverage.json')), false);
  });
});

test('local coverage retains support for selecting tests and passing Jest options', () => {
  runnerFixture((directory, invoke) => {
    const args = ['--runTestsByPath', 'src/test/unit/example.test.ts', '--coverageReporters=lcov'];
    assert.equal(invoke({}, args).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(join(directory, 'jest-arguments.json'))).slice(-args.length), args);
  });
});

test('Jenkins reuses matching coverage without spawning Jest, and rejects missing or changed reports', () => {
  runnerFixture((directory, invoke) => {
    const env = {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'pull_request', GITHUB_RUN_ID: '12', GITHUB_RUN_ATTEMPT: '2'};
    assert.equal(invoke(env).status, 0);
    rmSync(join(directory, 'jest-arguments.json'));
    assert.equal(invoke({CUI_UNIT_COVERAGE_FROM_ACTIONS: 'true'}).status, 0);
    assert.notEqual(invoke({CUI_UNIT_COVERAGE_FROM_ACTIONS: 'true'}, ['--runTestsByPath', 'another.test.ts']).status, 0);
    assert.equal(existsSync(join(directory, 'jest-arguments.json')), false);
    writeFileSync(join(directory, 'coverage/lcov.info'), 'changed');
    assert.notEqual(invoke({CUI_UNIT_COVERAGE_FROM_ACTIONS: 'true'}).status, 0);
    rmSync(join(directory, 'coverage/unit-coverage.json'));
    assert.notEqual(invoke({CUI_UNIT_COVERAGE_FROM_ACTIONS: 'true'}).status, 0);
    assert.equal(existsSync(join(directory, 'jest-arguments.json')), false);
  });
});
