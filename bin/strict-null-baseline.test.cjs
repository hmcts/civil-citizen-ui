const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const {countDiagnostics, reportBaseline} = require('./strict-null-baseline.cjs');

const strictConfig = path.resolve(__dirname, '..', 'tsconfig.strict.json');
const tsc = require.resolve('typescript/bin/tsc');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'strict-null-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  fs.mkdirSync(path.join(directory, 'src/main'), {recursive: true});
  fs.mkdirSync(path.join(directory, 'src/test'), {recursive: true});
  fs.writeFileSync(path.join(directory, 'src/main/clean.ts'), 'export const value: string = "safe";');
  fs.writeFileSync(path.join(directory, 'src/main/debt.ts'), 'export const debt: string = undefined;');
  fs.writeFileSync(path.join(directory, 'src/test/debt.ts'), 'export const debt: number = null;');
  fs.writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {types: [], skipLibCheck: true, noEmit: true},
    include: ['src/**/*.ts'],
  }));
  const gate = path.join(directory, 'tsconfig.strict.json');
  const configure = include => fs.writeFileSync(gate, JSON.stringify({
    extends: strictConfig,
    compilerOptions: {types: [], noUnusedLocals: false},
    include,
  }));
  configure(['src/main/clean.ts']);
  return {directory, gate, configure};
}

function compile(project) {
  return spawnSync(process.execPath, [tsc, '--noEmit', '--pretty', 'false', '-p', project], {encoding: 'utf8'});
}

test('counts each diagnostic once, including Windows paths and errors without a file', () => {
  assert.deepEqual(countDiagnostics([
    'src/main/a.ts(1,1): error TS2322: Type undefined is not assignable.',
    '  Type undefined is not assignable to string.',
    'C:\\repo\\src\\test\\a.ts(2,3): error TS18048: value is possibly undefined.',
    'src/integration-test/a.ts(3,4): error TS2345: bad argument.',
    'tools/a.ts(1,2): error TS2322: bad type.',
    'error TS18003: No inputs were found.',
  ].join('\r\n')), {total: 5, main: 1, test: 2, other: 2});
});

test('the real allowlist config passes while existing errors remain outside its roots', t => {
  const {gate} = fixture(t);
  const result = compile(gate);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('adding a failing file to the real allowlist config blocks compilation', t => {
  const {gate, configure} = fixture(t);
  configure(['src/main/clean.ts', 'src/main/debt.ts']);
  const result = compile(gate);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /debt\.ts.*error TS2322/);
});

test('an allowlisted file cannot import unchecked strict-null debt', t => {
  const {directory, gate} = fixture(t);
  fs.writeFileSync(path.join(directory, 'src/main/clean.ts'), 'export {debt} from "./debt";');
  const result = compile(gate);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /debt\.ts.*error TS2322/);
});

test('the full baseline reports existing errors without failing and preserves raw diagnostics', t => {
  const {directory} = fixture(t);
  const project = path.join(directory, 'tsconfig.json');
  const reportPath = path.join(directory, 'baseline.log');
  const summaryPath = path.join(directory, 'summary.md');
  assert.equal(compile(project).status, 0, 'The original non-strict build must remain green.');
  assert.deepEqual(reportBaseline({project, reportPath, summaryPath}), {total: 2, main: 1, test: 1, other: 0});
  assert.match(fs.readFileSync(reportPath, 'utf8'), /error TS2322/);
  assert.match(fs.readFileSync(summaryPath, 'utf8'), /2 errors \(src\/main: 1, tests: 1, other: 0\)/);
  const cli = spawnSync(process.execPath, [path.join(__dirname, 'strict-null-baseline.cjs')], {
    cwd: directory,
    encoding: 'utf8',
    env: {...process.env, GITHUB_STEP_SUMMARY: summaryPath},
  });
  assert.equal(cli.status, 0, cli.stdout + cli.stderr);
  assert.match(cli.stdout, /strictNullChecks baseline: 2 errors/);
  assert.equal(compile(project).status, 0, 'Reporting must not change the original compiler configuration.');
});

test('a missing project cannot be reported as a clean baseline', t => {
  const {directory} = fixture(t);
  assert.throws(() => reportBaseline({project: path.join(directory, 'missing.json')}), /compiler failed/);
});
