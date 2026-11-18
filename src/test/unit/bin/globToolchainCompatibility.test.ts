import {spawnSync} from 'child_process';
import {mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join, resolve} from 'path';

jest.retryTimes(0);

describe('glob toolchain compatibility with the security resolutions', () => {
  it('preserves real test discovery, lint selection, coverage exclusions and editor rules', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cui-glob-toolchain-'));
    try {
      // Native loading exercises each installed consumer, including Codecept's
      // own Mocha, without Jest transforms or application/browser startup.
      const result = spawnSync(process.execPath, ['--eval', String.raw`
        const assert = require('node:assert/strict');
        const fs = require('node:fs');
        const path = require('node:path');
        const {createRequire} = require('node:module');
        const root = process.argv[1];
        const load = createRequire(path.join(root, 'package.json'));
        const denyNetwork = () => { throw new Error('Toolchain checks must not open network connections'); };
        require('node:net').Socket.prototype.connect = denyNetwork;
        require('node:tls').connect = denyNetwork;

        for (const name of ['nested/pass.test.js', 'nested/pass.test.ts', 'ignored/skip.test.js', 'readme.txt']) {
          fs.mkdirSync(path.dirname(name), {recursive: true});
          fs.writeFileSync(name, '');
        }
        fs.writeFileSync('.editorconfig', 'root = true\n[*]\nindent_size = 4\n[*.{js,ts}]\nindent_size = 2\n');
        const expected = ['nested/pass.test.js', 'nested/pass.test.ts'];
        const relative = files => files.map(file => path.relative(process.cwd(), file)).sort();

        (async () => {
          const codeceptLoad = createRequire(load.resolve('codeceptjs'));
          for (const resolveMocha of [load, codeceptLoad]) {
            const collectFiles = resolveMocha('mocha/lib/cli/collect-files');
            const result = collectFiles({
              spec: ['**/*.test.{js,ts}'],
              ignore: ['**/ignored/**'],
              extension: ['js', 'ts'],
              file: [], recursive: true, sort: true,
            });
            assert.deepEqual(relative(result.files), expected, 'Mocha must discover both extensions and exclude ignored tests');
            assert.deepEqual(result.unmatchedFiles, []);
          }

          const {ESLint} = load('eslint');
          const eslint = new ESLint({
            cwd: process.cwd(), overrideConfigFile: true,
            overrideConfig: [
              {files: ['**/*.{js,ts}'], settings: {selectedByGlob: true}},
              {ignores: ['**/ignored/**']},
            ],
          });
          for (const file of expected) {
            const config = await eslint.calculateConfigForFile(file);
            assert.equal(config.settings.selectedByGlob, true, 'ESLint must apply the matching file config');
          }
          assert.equal(await eslint.calculateConfigForFile('ignored/skip.test.js'), undefined);
          assert.equal(await eslint.calculateConfigForFile('readme.txt'), undefined);

          const TestExclude = load('test-exclude');
          const coverage = new TestExclude({
            cwd: process.cwd(), include: ['**/*.{js,ts}'],
            exclude: ['**/ignored/**'], extension: ['.js', '.ts'],
          });
          assert.deepEqual((await coverage.glob()).sort(), expected, 'Coverage globbing must retain its exclusions');
          assert.equal(coverage.shouldInstrument(path.resolve('ignored/skip.test.js')), false);
          assert.equal(coverage.shouldInstrument(path.resolve('../outside.js')), false);

          const editorconfig = load('editorconfig');
          assert.equal(editorconfig.parseSync(path.resolve(expected[0])).indent_size, 2);
          assert.equal(editorconfig.parseSync(path.resolve(expected[1])).indent_size, 2);
          assert.equal(editorconfig.parseSync(path.resolve('readme.txt')).indent_size, 4);

          const readdirGlob = load('readdir-glob');
          const matches = await new Promise((resolveMatches, reject) => {
            const files = [];
            readdirGlob('.', {pattern: '**/*.{js,ts}', ignore: '**/ignored/**', nodir: true})
              .on('match', file => files.push(file.relative))
              .on('error', reject)
              .on('end', () => resolveMatches(files.sort()));
          });
          assert.deepEqual(matches, expected, 'Archive traversal must preserve file patterns and exclusions');
        })().catch(error => { console.error(error); process.exitCode = 1; });
      `, resolve(__dirname, '../../../..')], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 15000,
        env: {PATH: process.env.PATH},
      });
      if (result.error || result.status !== 0) {
        throw new Error(result.error?.message || result.stderr || result.stdout);
      }
      expect(result.signal).toBeNull();
    } finally {
      rmSync(directory, {recursive: true, force: true});
    }
  });
});
