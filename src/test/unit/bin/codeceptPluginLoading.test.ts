import {spawnSync} from 'child_process';
import {mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join, resolve} from 'path';

jest.retryTimes(0);

describe('functional reporting plugin with the installed CodeceptJS loader', () => {
  it('loads the enabled plugin and preserves failed, passed and unexecuted file reports', () => {
    const directory = mkdtempSync(join(tmpdir(), 'cui-codecept-plugin-'));
    try {
      // A separate Node process exercises native ESM loading, which Jest's
      // transforms would otherwise hide. No browser or service hooks are run.
      const result = spawnSync(process.execPath, ['--eval', `
        const assert = require('node:assert/strict');
        const fs = require('node:fs/promises');
        const path = require('node:path');
        const root = process.argv[1];
        const denyNetwork = () => { throw new Error('Plugin loading must not open network connections'); };
        require('node:net').Socket.prototype.connect = denyNetwork;
        require('node:tls').connect = denyNetwork;
        const {container, event, store} = require(path.join(root, 'node_modules/codeceptjs'));
        const {createTest} = require(path.join(root, 'node_modules/codeceptjs/lib/mocha/test.js'));
        const {Suite} = require(path.join(root, 'node_modules/mocha'));
        const {config} = require(path.join(root, 'codecept.conf.js'));
        const pluginName = 'failedAndNotExecutedTestFilesPlugin';
        const plugin = config.plugins[pluginName];
        assert.ok(plugin.enabled, 'FUNCTIONAL=true must enable the reporting plugin');
        store.codeceptDir = root;

        (async () => {
          await container.create({plugins: {[pluginName]: plugin}}, {});
          // Await the registered async handlers directly so filesystem writes
          // finish before the final report, without polling or arbitrary sleeps.
          const notify = async (name, value) => {
            const listeners = event.dispatcher.listeners(name);
            assert.equal(listeners.length, 1, 'Expected the real reporting handler for ' + name);
            await listeners[0](value);
          };
          const file = name => path.join(root, 'src/test/functionalTests/tests', name + '.js');
          const scenario = (name, title) => {
            const test = createTest(title, async () => {});
            test.file = file(name);
            test.addToSuite(new Suite('Reporting ' + name));
            assert.equal(typeof test.uid, 'string');
            return test;
          };
          const failed = scenario('failed', 'fails');
          const sibling = scenario('failed', 'passes in the same file');
          const retried = scenario('passed', 'passes after retry');
          const retry = scenario('passed', 'passes after retry');
          assert.notEqual(failed.uid, sibling.uid);
          assert.equal(retried.uid, retry.uid);
          await fs.mkdir('test-results/functional', {recursive: true});
          await config.bootstrapAll();
          await notify(event.all.before, {testFiles: [file('failed'), file('passed'), file('unexecuted')]});
          await notify(event.test.failed, failed);
          await notify(event.test.passed, sibling);
          await notify(event.test.failed, retried);
          await notify(event.test.passed, retry);
          // A passing sibling must not erase another scenario's failure; only
          // a successful retry of that scenario removes its failed record.
          assert.deepEqual(JSON.parse(await fs.readFile('test-results/functional/tempFailedTests.json', 'utf8')), [
            {testId: failed.uid, testFile: './src/test/functionalTests/tests/failed.js'},
          ]);
          await config.teardownAll();

          const report = JSON.parse(await fs.readFile('test-results/functional/testFilesReport.json', 'utf8'));
          assert.deepEqual(report.failedTestFiles, ['./src/test/functionalTests/tests/failed.js']);
          assert.deepEqual(report.passedTestFiles, ['./src/test/functionalTests/tests/passed.js']);
          assert.deepEqual(report.notExecutedTestFiles, ['./src/test/functionalTests/tests/unexecuted.js']);
          assert.deepEqual(await fs.readdir('test-results/functional'), ['testFilesReport.json']);
        })().catch(error => { console.error(error); process.exitCode = 1; });
      `, resolve(__dirname, '../../../..')], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 15000,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: 'test',
          NODE_CONFIG_DIR: resolve(__dirname, '../../../../config'),
          FUNCTIONAL: 'true',
          TEST_PASSWORD: 'plugin-test-only',
          DOTENV_CONFIG_QUIET: 'true',
        },
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
