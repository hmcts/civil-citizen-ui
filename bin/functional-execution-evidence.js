#!/usr/bin/env node
// Use Codecept's own loader so data scenarios, inherited tags and skips match CI.
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const reportDir = 'test-results/functional';
const manifestPath = `${reportDir}/execution-selection.json`;
const buckets = ['thin-client', 'residual', 'mocked'];
const normalise = title => title.trim().replace(/\s+/g, ' ');

function patterns(base) {
  return {
    'thin-client': `(?=.*(?:${base}))(?=.*@thin-full-stack)(?!.*@mocked-functional)`,
    residual: `(?=.*(?:${base}))(?!.*@thin-full-stack)(?!.*@mocked-functional)`,
    mocked: `(?=.*(?:${base}))(?=.*@mocked-functional)(?!.*@thin-full-stack)`,
  };
}

function plan(base) {
  const Codecept = require('codeceptjs/lib/codecept');
  const config = require('codeceptjs/lib/config').load('.');
  config.plugins = {};
  const codecept = new Codecept(config, {});
  codecept.init(process.cwd());
  codecept.loadTests();
  const mocha = require('codeceptjs/lib/container').mocha();
  mocha.files = codecept.testFiles;
  mocha.loadFiles();
  const expressions = patterns(base);
  const scenarios = [];
  mocha.suite.eachTest(test => {
    const title = normalise(test.fullTitle());
    if (!new RegExp(base).test(title)) return;
    const matches = buckets.filter(bucket => new RegExp(expressions[bucket]).test(title));
    if (matches.length !== 1) throw new Error(`Scenario must belong to exactly one bucket: ${title}`);
    scenarios.push({
      id: `${path.relative(process.cwd(), test.file)}::${title}`,
      title, file: path.relative(process.cwd(), test.file),
      bucket: matches[0], skipped: Boolean(test.isPending()),
    });
  });
  if (!scenarios.length) throw new Error('Baseline selection is empty');
  if (new Set(scenarios.map(s => s.id)).size !== scenarios.length) throw new Error('Duplicate scenario identity');
  const manifest = {
    revision: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(),
    base, patterns: expressions, scenarios,
  };
  fs.mkdirSync(reportDir, {recursive: true});
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(Object.fromEntries(buckets.map(bucket => [bucket, scenarios.filter(s => s.bucket === bucket && !s.skipped).length]))));
  return manifest;
}

function reconcile(manifest, mode, reports) {
  const errors = [];
  const observed = new Map();
  const expected = new Map(manifest.scenarios.map(s => [s.id, s]));
  function visit(suite, bucket) {
    for (const test of suite.tests || []) {
      // Mochawesome includes tests excluded by grep. Only executed or explicitly
      // pending records count; excluded and bailed-out tests have no state.
      if (!test.pending && !test.pass && !test.fail) continue;
      if (test.pending && !new RegExp(mode === 'optimised' ? manifest.patterns[bucket] : manifest.base).test(test.fullTitle)) continue;
      const file = (suite.file || suite.fullFile || '').replace(/^.*?(?=src\/test\/)/, '');
      const id = `${file}::${normalise(test.fullTitle)}`;
      const scenario = expected.get(id);
      if (!scenario) { errors.push(`Unexpected scenario: ${id}`); continue; }
      if (mode === 'optimised' && bucket !== scenario.bucket) errors.push(`Wrong bucket: ${id}`);
      if (observed.has(id)) errors.push(`Duplicate scenario: ${id}`);
      observed.set(id, test.pass ? 'passed' : test.fail ? 'failed' : 'skipped');
    }
    for (const child of suite.suites || []) visit(child, bucket);
  }
  for (const {bucket, data} of reports) for (const suite of data.results || []) visit(suite, bucket);
  const scenarios = manifest.scenarios.map(s => {
    const excluded = mode === 'optimised' && s.bucket === 'residual';
    const outcome = observed.get(s.id) || (excluded ? 'excluded' : s.skipped ? 'skipped' : 'missing');
    if (excluded && observed.has(s.id)) errors.push(`Residual scenario executed in optimised mode: ${s.id}`);
    if (!excluded && !s.skipped && ['missing', 'skipped'].includes(outcome)) errors.push(`${outcome}: ${s.id}`);
    if (!excluded && s.skipped && outcome !== 'skipped') errors.push(`Baseline skip changed: ${s.id}`);
    return {...s, outcome};
  });
  const counts = rows => ({selected: rows.length, ...Object.fromEntries(['passed', 'failed', 'skipped', 'missing', 'excluded'].map(state => [state, rows.filter(s => s.outcome === state).length]))});
  return {revision: manifest.revision, base: manifest.base, mode, counts: counts(scenarios),
    buckets: Object.fromEntries(buckets.map(bucket => [bucket, counts(scenarios.filter(s => s.bucket === bucket))])),
    errors, scenarios};
}

function main() {
  const [command, arg] = process.argv.slice(2);
  if (command === 'plan') return plan(arg);
  if (command === 'compare') {
    const standard = JSON.parse(fs.readFileSync(arg));
    const optimised = JSON.parse(fs.readFileSync(process.argv[4]));
    const migrated = result => result.scenarios
      .filter(s => s.bucket !== 'residual')
      .map(s => `${s.id}:${s.outcome}`).sort();
    if (standard.mode !== 'standard' || optimised.mode !== 'optimised'
      || standard.revision !== optimised.revision || standard.base !== optimised.base
      || standard.errors.length || optimised.errors.length
      || standard.counts.failed || optimised.counts.failed
      || JSON.stringify(migrated(standard)) !== JSON.stringify(migrated(optimised))) {
      throw new Error('Paired verification failed: revision, selection or outcomes do not reconcile');
    }
    console.log(JSON.stringify({parity: true, counts: standard.counts, buckets: optimised.buckets,
      standardTimings: standard.timings, optimisedTimings: optimised.timings}, null, 2));
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  if (command === 'pattern') return console.log(manifest.patterns[arg]);
  if (command === 'count') return console.log(manifest.scenarios.filter(s => s.bucket === arg && !s.skipped).length);
  if (command !== 'check') throw new Error('Expected plan, pattern, count or check');
  const reports = fs.readdirSync(reportDir).filter(file => arg === 'optimised'
    ? /^optimised-(thin-client|residual|mocked)-.*\.json$/.test(file)
    : /^civil-citizen-(pr|master)-.*\.json$/.test(file)).map(file => ({
    bucket: buckets.find(bucket => file.startsWith(`optimised-${bucket}-`)),
    data: JSON.parse(fs.readFileSync(path.join(reportDir, file))),
  }));
  const result = reconcile(manifest, arg, reports);
  const timingPath = `${reportDir}/${arg}-timings.csv`;
  if (fs.existsSync(timingPath)) result.timings = Object.fromEntries(fs.readFileSync(timingPath, 'utf8').trim().split('\n').slice(1).map(line => {
    const [name, seconds] = line.split(',');
    return [name, Number(seconds)];
  }));
  fs.writeFileSync(`${reportDir}/execution-results.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({counts: result.counts, buckets: result.buckets, errors: result.errors}, null, 2));
  if (result.errors.length || result.counts.failed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = {patterns, reconcile};
