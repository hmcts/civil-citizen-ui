import {copyFile, mkdtemp, readFile, rm} from 'fs/promises';
import os from 'os';
import path from 'path';
import {CaptureServer, captureUrl, startCaptureServer} from '../../test/a11y/captureServer';
import {translateUrlToFilePath} from '../../test/utils/mocks/a11y/urlToFileName';
import {IGNORED_URLS} from '../../test/a11y/ignored-urls';
import * as urls from 'routes/urls';

let server: CaptureServer;
afterEach(async () => {await server?.close();});

it('serves the selected capture with the real built stylesheet and script', async () => {
  server = await startCaptureServer([urls.RESPONSE_TASK_LIST_URL]);
  const response = await fetch(server.baseUrl + captureUrl(urls.RESPONSE_TASK_LIST_URL));
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

it('uses the installed production bootstrap without changing captured forms or page data', async () => {
  // Exercise the actual Pa11y selection, including its deliberate action/route
  // exclusions, rather than exposing ignored fixtures as new GET journeys.
  const selected = Object.values(urls).filter(url => !IGNORED_URLS.includes(url));
  expect(selected).toHaveLength(345);
  expect(selected).toEqual(expect.arrayContaining([urls.CCJ_DEFENDANT_DOB_URL, urls.RESPONSE_TASK_LIST_URL]));
  server = await startCaptureServer(selected);
  const template = await readFile(path.resolve(__dirname, '../../../node_modules/govuk-frontend/dist/govuk/template.njk'), 'utf8');
  const productionBootstrap = template.match(/<script\b[^>]*>(document\.body\.className[\s\S]*?)<\/script>/)![1];
  for (let index = 0; index < selected.length; index += 8) {
    await Promise.all(selected.slice(index, index + 8).map(async url => {
      const original = await readFile(translateUrlToFilePath(captureUrl(url)), 'utf8');
      const response = await fetch(server.baseUrl + captureUrl(url));
      expect({url, status: response.status}).toEqual({url, status: 200});
      const served = await response.text();
      expect(served).toContain(productionBootstrap);
      const bootstrap = /(<script\b[^>]*>)\s*document\.body\.className[\s\S]*?<\/script>/i;
      // Every byte outside the bootstrap, including forms and saved values,
      // must match the stored capture rather than a regenerated scenario.
      expect(served.replace(bootstrap, '$1</script>')).toBe(original.replace(bootstrap, '$1</script>'));
    }));
  }
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
