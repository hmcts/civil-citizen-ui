import fs from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
import {spawnSync} from 'child_process';
const {assertPrivateRuntimePath, isolatedEnvironment} = require('../../../../../bin/ui-preview.cjs');

describe('preview runtime ownership', () => {
  let directory: string;
  beforeEach(() => {directory = fs.mkdtempSync(join(tmpdir(), 'preview-ownership-'));});
  afterEach(() => {jest.restoreAllMocks(); fs.rmSync(directory, {recursive: true, force: true});});

  it('accepts a private owned directory and files, including reuse after shutdown', () => {
    const state = join(directory, 'state.json');
    expect(() => assertPrivateRuntimePath(directory, true)).not.toThrow();
    expect(() => assertPrivateRuntimePath(state, false, true)).not.toThrow();
    fs.writeFileSync(state, '{}', {mode: 0o600});
    expect(() => assertPrivateRuntimePath(state)).not.toThrow();
    expect(() => assertPrivateRuntimePath(directory, true)).not.toThrow();
  });

  it('rejects another user’s existing directory', () => {
    const stat = fs.lstatSync(directory);
    jest.spyOn(fs, 'lstatSync').mockReturnValueOnce(Object.assign(stat, {uid: stat.uid + 1}));
    expect(() => assertPrivateRuntimePath(directory, true)).toThrow('Unsafe preview runtime path');
  });

  it.each([0o755, 0o770, 0o777])('rejects a directory with permissions %i without changing them', mode => {
    fs.chmodSync(directory, mode);
    expect(() => assertPrivateRuntimePath(directory, true)).toThrow('Unsafe preview runtime path');
    expect(fs.lstatSync(directory).mode & 0o777).toBe(mode);
  });

  it('rejects symlinked directories, symlinked files and hard-linked files', () => {
    const real = join(directory, 'real');
    fs.mkdirSync(real, {mode: 0o700});
    const linked = join(directory, 'linked');
    fs.symlinkSync(real, linked);
    expect(() => assertPrivateRuntimePath(linked, true)).toThrow('Unsafe preview runtime path');
    const state = join(real, 'state.json');
    fs.writeFileSync(state, 'private', {mode: 0o600});
    const alias = join(directory, 'state.json');
    fs.symlinkSync(state, alias);
    expect(() => assertPrivateRuntimePath(alias)).toThrow('Unsafe preview runtime path');
    fs.unlinkSync(alias);
    fs.linkSync(state, alias);
    expect(() => assertPrivateRuntimePath(alias)).toThrow('Unsafe preview runtime path');
    expect(fs.readFileSync(state, 'utf8')).toBe('private');
  });

  it('rejects readable existing files and dangling symlinks even when new files are allowed', () => {
    const state = join(directory, 'state.json');
    fs.writeFileSync(state, 'private', {mode: 0o644});
    expect(() => assertPrivateRuntimePath(state, false, true)).toThrow('Unsafe preview runtime path');
    fs.unlinkSync(state);
    fs.symlinkSync(join(directory, 'missing'), state);
    expect(() => assertPrivateRuntimePath(state, false, true)).toThrow('Unsafe preview runtime path');
  });

  it.each(['down', 'reset', 'logs'])('rejects an unsafe directory before %s reads or contacts anything', command => {
    fs.chmodSync(directory, 0o777);
    // Invalid JSON proves the launcher checks the directory before reading the state.
    fs.writeFileSync(join(directory, 'state.json'), 'not JSON');
    fs.writeFileSync(join(directory, 'application.log'), 'private log');
    const result = spawnSync(process.execPath, ['bin/ui-preview.cjs', command], {
      cwd: process.cwd(), encoding: 'utf8', env: {...process.env, UI_PREVIEW_RUNTIME_DIR: directory},
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Unsafe preview runtime path');
    expect(result.stdout).toBe('');
    expect(fs.readFileSync(join(directory, 'application.log'), 'utf8')).toBe('private log');
  });

  it.each([true, false])('down reports a stopped preview with an existing directory: %s', exists => {
    const result = spawnSync(process.execPath, ['bin/ui-preview.cjs', 'down'], {
      encoding: 'utf8', env: {...process.env, UI_PREVIEW_RUNTIME_DIR: exists ? directory : join(directory, 'missing')},
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('not running');
  });

  it('omits absent platform variables while retaining supplied values', () => {
    const before = {...process.env};
    try {
      delete process.env.SYSTEMROOT;
      const environment = isolatedEnvironment('http://127.0.0.1:1111', directory);
      expect(environment).not.toHaveProperty('SYSTEMROOT');
      expect(Object.values(environment)).not.toContain(undefined);
      process.env.SYSTEMROOT = 'C:\\Windows';
      expect(isolatedEnvironment('http://127.0.0.1:1111', directory).SYSTEMROOT).toBe('C:\\Windows');
    } finally {process.env = before;}
  });
});
