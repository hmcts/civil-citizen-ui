import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

describe('unit coverage handoff using native Node and real ZIP archives', () => {
  it('preserves test execution, commit isolation, report integrity and credential boundaries', () => {
    const result = spawnSync(process.execPath, ['--test', 'bin/unit-coverage.test.mjs'], {
      cwd: resolve(__dirname, '../../../..'), encoding: 'utf8', timeout: 30000,
    });
    expect({
      status: result.status,
      output: result.stderr || result.stdout || result.error?.message,
    }).toEqual(expect.objectContaining({status: 0}));
  });
});
