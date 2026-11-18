import {spawnSync} from 'child_process';
import {resolve} from 'path';

describe('unit coverage handoff using native Node and real ZIP archives', () => {
  it('preserves test execution, commit isolation, report integrity and credential boundaries', () => {
    const result = spawnSync(process.execPath, ['--test', 'bin/unit-coverage.test.mjs'], {
      cwd: resolve(__dirname, '../../../..'), encoding: 'utf8', timeout: 30000,
    });
    if (result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
  });
});
