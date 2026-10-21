import {spawnSync} from 'child_process';
import {join} from 'path';

it('ready pages and upload prerequisites work in isolated and sequential bilingual journeys', () => {
  const result = spawnSync(process.execPath, [join(process.cwd(), 'src/test/utils/uiPreviewRouteProbe.cjs')], {
    cwd: process.cwd(), env: process.env, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`Catalogue probe failed:\n${result.stderr}\n${result.stdout.slice(-12000)}`);
  expect(result.error).toBeUndefined(); expect(result.status).toBe(0);
  const record = result.stdout.split('\n').find(line => line.startsWith('ROUTE_PROBE ')); expect(record).toBeDefined();
  const report = JSON.parse(record!.slice(12));
  expect(report.pages).toBeGreaterThan(250); expect(report.count).toBe(report.pages * 4);
  expect(report.journeys).toBe(4); expect(report.failures).toEqual([]);
}, 130000);
