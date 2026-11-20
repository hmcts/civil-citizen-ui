import {spawnSync} from 'child_process';
import {mkdtempSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import {join} from 'path';
const {uiPreviewProbeEnvironment} = require('../../test/utils/uiPreviewProbeEnvironment.cjs');

it('ready pages and upload prerequisites work in isolated and sequential bilingual journeys', () => {
  const directory = mkdtempSync(join(tmpdir(), 'preview-catalogue-probe-'));
  const originalEnvironment = process.env;
  let result;
  try {
    // The complete route sweep must not depend on the parent's service or loader configuration.
    process.env = {...originalEnvironment,
      CIVIL_SERVICE_URL: 'https://unrelated.invalid', IDAM_API_URL: 'https://unrelated.invalid',
      HTTP_PROXY: 'http://unrelated.invalid', HTTPS_PROXY: 'http://unrelated.invalid',
      NODE_CONFIG_DIR: join(directory, 'missing-config'), TS_NODE_PROJECT: join(directory, 'missing-tsconfig.json'),
      NODE_OPTIONS: '--require=missing-preview-preloader', APPINSIGHTS_KEY: 'unrelated-key',
    };
    result = spawnSync(process.execPath, [join(process.cwd(), 'src/test/utils/uiPreviewRouteProbe.cjs')], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024,
      env: uiPreviewProbeEnvironment(directory),
    });
  } finally {
    process.env = originalEnvironment;
    rmSync(directory, {recursive: true, force: true});
  }
  if (result.status !== 0) throw new Error(`Catalogue probe failed:\n${result.stderr}\n${result.stdout.slice(-12000)}`);
  expect(result.error).toBeUndefined(); expect(result.status).toBe(0);
  const record = result.stdout.split('\n').find(line => line.startsWith('ROUTE_PROBE ')); expect(record).toBeDefined();
  const report = JSON.parse(record!.slice(12));
  expect(report.pages).toBeGreaterThan(250); expect(report.count).toBe(report.pages * 4);
  expect(report.journeys).toBe(6); expect(report.failures).toEqual([]);
}, 130000);
