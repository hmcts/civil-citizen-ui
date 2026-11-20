import {SIGN_IN_URL} from 'routes/urls';
import {spawnSync} from 'child_process';
import {mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
const {uiPreviewProbeEnvironment} = require('../../test/utils/uiPreviewProbeEnvironment.cjs');

describe('real application preview registration and authentication boundary', () => {
  it.each([['production', 'true'], ['e2eTest', 'false'], ['e2eTest', 'true']])('%s / flag=%s', (mode, flag) => {
    const directory = mkdtempSync(join(tmpdir(), 'preview-application-probe-'));
    const originalEnvironment = process.env;
    let child;
    try {
      // Exercise real application startup despite conflicting developer/CI settings.
      process.env = {...originalEnvironment,
        CIVIL_SERVICE_URL: 'https://unrelated.invalid', IDAM_API_URL: 'https://unrelated.invalid',
        HTTP_PROXY: 'http://unrelated.invalid', HTTPS_PROXY: 'http://unrelated.invalid',
        NODE_CONFIG_DIR: join(directory, 'missing-config'), TS_NODE_PROJECT: join(directory, 'missing-tsconfig.json'),
        NODE_OPTIONS: '--require=missing-preview-preloader', APPINSIGHTS_KEY: 'unrelated-key',
      };
      child = spawnSync(process.execPath, [join(process.cwd(), 'src/test/utils/uiPreviewApplicationProbe.cjs')], {
        cwd: process.cwd(), encoding: 'utf8', timeout: 45000,
        env: uiPreviewProbeEnvironment(directory, mode, flag),
      });
    } finally {
      process.env = originalEnvironment;
      rmSync(directory, {recursive: true, force: true});
    }
    if (child.error || child.status !== 0) throw new Error(`Application probe failed (${mode} / flag=${flag}):\n${child.error?.message || ''}\n${child.stderr}\n${child.stdout?.slice(-12000) || ''}`);
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
