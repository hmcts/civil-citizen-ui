import {SIGN_IN_URL} from 'routes/urls';
import {spawnSync} from 'child_process';
import {join} from 'path';

describe('real application preview registration and authentication boundary', () => {
  it.each([['production', 'true'], ['e2eTest', 'false'], ['e2eTest', 'true']])('%s / flag=%s', (mode, flag) => {
    const child = spawnSync(process.execPath, [join(process.cwd(), 'src/test/utils/uiPreviewApplicationProbe.cjs'), mode, flag], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 45000, env: {...process.env, LOG_LEVEL: 'ERROR'},
    });
    expect(child.error).toBeUndefined(); expect(child.status).toBe(0);
    const line = child.stdout.split('\n').find(value => value.startsWith('PROBE ')); expect(line).toBeDefined();
    const probe = JSON.parse(line!.slice(6)); const enabled = mode === 'e2eTest' && flag === 'true';
    for (const path of ['/ui-preview', '/ui-preview/', '/ui-preview?UI_PREVIEW_ENABLED=true']) {
      expect(probe.results[path].status).toBe(enabled ? 200 : 404);
      expect(probe.results[path].marker).toBe(enabled ? 'synthetic-local-only' : null);
      if (!enabled) expect(probe.results[path].cookie || '').not.toContain('citizen-ui-session');
    }
    expect(probe.ready).toBe(enabled); expect(probe.previewKeys.length > 0).toBe(enabled);
    expect(probe.methodStatus).toBe(enabled ? 405 : 404);
    expect(probe.results[probe.asset].status).toBe(200);
    expect(probe.results[probe.asset].cookie || '').not.toContain('citizen-ui-session');
    for (const path of ['/ui-preview-other', '/ui-preview/nested', '/%75i-preview', '/UI-PREVIEW']) {
      expect(probe.results[path].marker).toBeNull();
      if (mode === 'production') {
        expect(probe.results[path].status).toBe(302); expect(probe.results[path].location).toBe(SIGN_IN_URL);
      }
    }
    if (mode === 'production') expect(probe.results['/dashboard'].location).toBe(SIGN_IN_URL);
  }, 50000);
});
