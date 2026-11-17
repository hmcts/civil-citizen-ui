const {spawnSync} = require('node:child_process');
const fs = require('node:fs');

function countDiagnostics(output) {
  const counts = {total: 0, main: 0, test: 0, other: 0};
  for (const line of output.split(/\r?\n/)) {
    // Count diagnostic headers once, not their indented explanation lines.
    const diagnostic = line.match(/^(.*?)\(\d+,\d+\): error TS\d+:/);
    if (!diagnostic && !/^error TS\d+:/.test(line)) continue;
    const file = diagnostic ? diagnostic[1].replace(/\\/g, '/') : '';
    const scope = /(?:^|\/)src\/main\//.test(file) ? 'main'
      : /(?:^|\/)src\/(?:test|integration-test)\//.test(file) ? 'test' : 'other';
    counts.total++;
    counts[scope]++;
  }
  return counts;
}

function reportBaseline({project = 'tsconfig.json', reportPath, summaryPath = process.env.GITHUB_STEP_SUMMARY} = {}) {
  const result = spawnSync(process.execPath, [
    require.resolve('typescript/bin/tsc'), '--noEmit', '--strictNullChecks',
    '--pretty', 'false', '--project', project,
  ], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  if (result.error) throw result.error;
  const output = (result.stdout || '') + (result.stderr || '');
  if (reportPath) fs.writeFileSync(reportPath, output);
  const counts = countDiagnostics(output);
  const hasFileDiagnostics = /^.+\(\d+,\d+\): error TS\d+:/m.test(output);
  if (result.signal || ![0, 1, 2].includes(result.status) || (result.status !== 0 && !hasFileDiagnostics)) {
    throw new Error(`Strict null baseline compiler failed (status ${result.status}, signal ${result.signal}).\n${output}`);
  }
  const summary = `strictNullChecks baseline: ${counts.total} errors (src/main: ${counts.main}, tests: ${counts.test}, other: ${counts.other}).`;
  console.log(summary);
  console.log('Informational only. The separate tsconfig.strict.json allowlist is the blocking gate.');
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `### Strict null baseline\n\n${summary}\n\nThis full-repository count is informational. See the diagnostic artifact for file locations.\n`);
  }
  // Existing compiler diagnostics are expected here and do not fail CI.
  return counts;
}

if (require.main === module) {
  try {
    reportBaseline({reportPath: process.argv[2]});
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {countDiagnostics, reportBaseline};
