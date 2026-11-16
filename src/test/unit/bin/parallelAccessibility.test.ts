import {spawnSync} from 'child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'fs';
import {tmpdir} from 'os';
import {join, resolve} from 'path';

describe('parallel accessibility setup on a fresh agent', () => {
  it.each([false, true])('builds before workers and stops if the build fails (%s)', failBuild => {
    const directory = mkdtempSync(join(tmpdir(), 'hmcts-accessibility-'));
    const log = join(directory, 'commands');
    try {
      writeFileSync(join(directory, 'yarn'), `#!/bin/bash
echo "yarn $* NODE_ENV=$NODE_ENV" >> "$COMMAND_LOG"
if [[ "$1" == build ]]; then
  [[ "$NODE_ENV" == development ]] || exit 10
  [[ "$FAIL_BUILD" != true ]] || exit 11
  touch "$ASSETS_READY"
else
  [[ -f "$ASSETS_READY" ]] || exit 12
fi
`, {mode: 0o755});
      writeFileSync(join(directory, 'node'), '#!/bin/bash\necho "browser install" >> "$COMMAND_LOG"\n', {mode: 0o755});
      const result = spawnSync('bash', [resolve(__dirname, '../../../test/a11y/run-parallel-a11y-tests.sh')], {
        encoding: 'utf8', timeout: 10000,
        env: {...process.env, PATH: `${directory}:${process.env.PATH}`, NODE_ENV: 'production',
          A11Y_CHUNKS: '4', COMMAND_LOG: log, ASSETS_READY: join(directory, 'assets'), FAIL_BUILD: String(failBuild)},
      });
      const commands = readFileSync(log, 'utf8').trim().split('\n');
      expect(commands[0]).toBe('yarn build NODE_ENV=development');
      if (failBuild) {
        expect(result.status).toBe(11);
        expect(commands).toHaveLength(1);
      } else {
        expect(result.status).toBe(0);
        expect(commands[1]).toBe('browser install');
        expect(commands.filter(command => command.startsWith('yarn tests:a11y '))).toHaveLength(4);
      }
    } finally {
      rmSync(directory, {recursive: true, force: true});
    }
  });
});
