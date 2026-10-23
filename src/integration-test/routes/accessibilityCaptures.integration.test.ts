import {copyFile, mkdtemp, rm} from 'fs/promises';
import os from 'os';
import path from 'path';
import {CaptureServer, captureUrl, startCaptureServer} from '../../test/a11y/captureServer';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';

let server: CaptureServer;
afterEach(async () => {await server?.close();});

it('serves the selected capture with the real built stylesheet and script', async () => {
  server = await startCaptureServer([RESPONSE_TASK_LIST_URL]);
  const response = await fetch(server.baseUrl + captureUrl(RESPONSE_TASK_LIST_URL));
  expect(response.status).toBe(200);
  expect(response.headers.get('set-cookie')).toMatch(/lang=en;/);
  const html = await response.text();
  expect(html).toContain('main-dev.css');
  expect(html).toContain('main-dev.js');
  expect(html).toContain('task-list-heading');
  for (const [asset, type] of [['main-dev.css', /text\/css/], ['main-dev.js', /javascript/]] as const) {
    const resource = await fetch(`${server.baseUrl}/${asset}`);
    expect(resource.status).toBe(200);
    expect(resource.headers.get('content-type')).toMatch(type);
    expect((await resource.text()).length).toBeGreaterThan(100);
  }
  expect((await fetch(`${server.baseUrl}/package.json`)).status).toBe(404);
});

it.each(['main-dev.css', 'main-dev.js'])('fails setup when %s is absent and releases its listening port', async missing => {
  server = await startCaptureServer([]);
  const port = Number(new URL(server.baseUrl).port);
  await server.close();
  const empty = await mkdtemp(path.join(os.tmpdir(), 'a11y-assets-'));
  try {
    const retained = missing === 'main-dev.css' ? 'main-dev.js' : 'main-dev.css';
    await copyFile(path.resolve(__dirname, '../../main/public', retained), path.join(empty, retained));
    await expect(startCaptureServer([], {publicDirectory: empty, port})).rejects.toThrow(`Accessibility requires built /${missing}`);
    server = await startCaptureServer([], {port});
    expect(new URL(server.baseUrl).port).toBe(String(port));
  } finally {
    await rm(empty, {recursive: true, force: true});
  }
});

it('awaits shutdown and can be closed repeatedly without leaking a server', async () => {
  server = await startCaptureServer([]);
  await server.close();
  await server.close();
  await expect(fetch(server.baseUrl)).rejects.toThrow();
});
