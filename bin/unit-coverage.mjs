import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REPOSITORY = 'hmcts/civil-citizen-ui';
const API = `https://api.github.com/repos/${REPOSITORY}`;
const digest = content => createHash('sha256').update(content).digest('hex');
const commit = () => execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();

export function validateCoverage(manifest, lcov, expected) {
  if (!manifest || manifest.version !== 1 || manifest.repository !== REPOSITORY || manifest.commit !== expected.commit
    || (expected.runId && String(manifest.runId) !== String(expected.runId))
    || (expected.runAttempt && String(manifest.runAttempt) !== String(expected.runAttempt))
    || manifest.lcovSha256 !== digest(lcov)
    || !lcov.toString().includes('SF:src/main/') || !lcov.toString().includes('end_of_record')) {
    throw new Error('Unit coverage does not match this checkout and successful Actions attempt');
  }
}

export function selectRun(runs, sha, pr) {
  return runs.filter(run => run.head_sha === sha && run.event === 'pull_request'
    && run.path === '.github/workflows/ci.yml' && run.repository?.full_name === REPOSITORY
    && run.pull_requests?.some(pull => pull.number === pr))
    .sort((a, b) => b.id - a.id || b.run_attempt - a.run_attempt)[0];
}

export async function fetchCoverage({sha, pr, token, fetchImpl = fetch,
  sleep = ms => new Promise(done => setTimeout(done, ms)), now = Date.now,
  timeoutMs = 10 * 60 * 1000, directory = 'coverage'} = {}) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? '') || !Number.isSafeInteger(pr) || pr < 1 || !token) {
    throw new Error('PR coverage requires a checkout commit, PR number and GitHub credential');
  }
  const api = async path => {
    const response = await fetchImpl(`${API}${path}`, {
      headers: {Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'},
      redirect: 'manual', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok && response.status !== 302) throw new Error(`GitHub unit coverage request failed (HTTP ${response.status})`);
    return response;
  };
  const deadline = now() + timeoutMs;
  let announced = false;
  while (now() < deadline) {
    const runs = await (await api(`/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${sha}&per_page=100`)).json();
    const run = selectRun(runs.workflow_runs ?? [], sha, pr);
    if (run?.status === 'completed') {
      if (run.conclusion !== 'success') throw new Error(`Actions CI for this commit finished with ${run.conclusion}`);
      const artifacts = await (await api(`/actions/runs/${run.id}/artifacts?per_page=100`)).json();
      const name = `unit-coverage-${sha}-${run.run_attempt}`;
      const artifact = artifacts.artifacts?.find(item => item.name === name && !item.expired);
      if (!artifact) throw new Error('Successful Actions run has no current unit coverage artifact; rerun Actions');
      const redirect = await api(`/actions/artifacts/${artifact.id}/zip`);
      const location = redirect.headers.get('location');
      if (redirect.status !== 302 || !location || new URL(location).protocol !== 'https:') {
        throw new Error('GitHub did not return a secure coverage download');
      }
      // Never forward the GitHub credential to the artifact storage host.
      const download = await fetchImpl(location, {signal: AbortSignal.timeout(30000)});
      if (!download.ok) throw new Error(`Coverage download failed (HTTP ${download.status})`);
      const chunks = [];
      let size = 0;
      for await (const chunk of download.body) {
        size += chunk.length;
        if (size > 20 * 1024 * 1024) throw new Error('Coverage archive exceeds the size limit');
        chunks.push(chunk);
      }
      const temporary = mkdtempSync(join(tmpdir(), 'hmcts-unit-coverage-'));
      try {
        const archive = join(temporary, 'coverage.zip');
        writeFileSync(archive, Buffer.concat(chunks));
        // Read only the two known members, without extracting archive paths.
        const extract = member => execFileSync('unzip', ['-p', archive, member], {maxBuffer: 32 * 1024 * 1024});
        const lcov = extract('lcov.info');
        const manifest = JSON.parse(extract('unit-coverage.json').toString());
        validateCoverage(manifest, lcov, {commit: sha, runId: run.id, runAttempt: run.run_attempt});
        mkdirSync(directory, {recursive: true});
        writeFileSync(join(directory, 'lcov.info'), lcov);
        writeFileSync(join(directory, 'unit-coverage.json'), JSON.stringify(manifest));
        console.log('Verified Actions unit coverage is ready for Sonar; Jenkins will not repeat Jest');
        return;
      } finally {
        rmSync(temporary, {recursive: true, force: true});
      }
    }
    if (!announced) {
      console.log('Waiting for Actions unit coverage for this PR checkout');
      announced = true;
    }
    await sleep(10000);
  }
  throw new Error('Timed out waiting for Actions unit coverage; no tests were skipped');
}

export function runCoverage(args = []) {
  const sha = commit();
  if (process.env.CUI_UNIT_COVERAGE_FROM_ACTIONS === 'true') {
    if (args.length) throw new Error('Additional Jest arguments require local unit execution');
    validateCoverage(JSON.parse(readFileSync('coverage/unit-coverage.json', 'utf8')),
      readFileSync('coverage/lcov.info'), {commit: sha});
    console.log('Using verified Actions unit coverage for this commit');
    return;
  }
  // Never leave an earlier successful manifest behind after a failed rerun.
  rmSync('coverage/unit-coverage.json', {force: true});
  const workers = process.env.JEST_MAX_WORKERS ?? '8';
  if (!/^[1-9]\d*$/.test(workers)) throw new Error('JEST_MAX_WORKERS must be a positive integer');
  const result = spawnSync(process.execPath, ['--disable-warning=DEP0060', '--no-sparkplug',
    './node_modules/jest/bin/jest.js', '--coverage', `--maxWorkers=${workers}`, '--silent', ...args], {
    stdio: 'inherit', env: {...process.env, LOG_LEVEL: 'OFF'},
  });
  if (result.error || result.status !== 0) throw new Error('Unit tests failed; coverage cannot be published');
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_EVENT_NAME === 'pull_request') {
    const manifest = {version: 1, repository: REPOSITORY, commit: sha,
      runId: process.env.GITHUB_RUN_ID, runAttempt: process.env.GITHUB_RUN_ATTEMPT,
      lcovSha256: digest(readFileSync('coverage/lcov.info'))};
    writeFileSync('coverage/unit-coverage.json', JSON.stringify(manifest));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'fetch') {
      await fetchCoverage({sha: commit(), pr: Number(process.env.CHANGE_ID), token: process.env.HMCTS_GITHUB_TOKEN});
    } else if (process.argv[2] === 'run') {
      runCoverage(process.argv.slice(3));
    } else {
      throw new Error('Expected run or fetch');
    }
  } catch (error) {
    // Request failures must not dump credential-bearing HTTP objects.
    console.error(error.message);
    process.exitCode = 1;
  }
}
