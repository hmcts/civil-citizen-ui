// Separate process: unit/integration setup mocks cannot replace the real app's
// OIDC or registration policy. Only non-preview Redis infrastructure is replaced.
const path = require('node:path');
const {tmpdir} = require('node:os');
const root = path.resolve(__dirname, '../../..');
require(path.join(root, 'node_modules/ts-node/register/transpile-only'));
require(path.join(root, 'node_modules/tsconfig-paths/register'));
const mode = process.argv[2];
const {isolatedEnvironment} = require(path.join(root, 'bin/ui-preview.cjs'));
Object.assign(process.env, isolatedEnvironment('http://127.0.0.1:1', tmpdir()), {
  NODE_ENV: mode, UI_PREVIEW_ENABLED: process.argv[3], UI_PREVIEW_FIXTURE_NOW: '2026-10-20T12:00:00Z',
});
require(path.join(root, 'bin/ui-preview-network.cjs'));
if (mode !== 'e2eTest') {
  const Redis = require(path.join(root, 'node_modules/ioredis-mock'));
  require(path.join(root, 'src/main/modules/draft-store')).DraftStoreClient.prototype.enableFor = app => {app.locals.draftStoreClient = new Redis();};
  require(path.join(root, 'src/main/modules/utilityService')).getRedisStoreForSession = () => new (require(path.join(root, 'node_modules/express-session')).MemoryStore)();
}
const {app} = require(path.join(root, 'src/main/app'));
(async () => {
  if (app.locals.uiPreviewReady) await app.locals.uiPreviewReady;
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const asset = require('fs').readFileSync(path.join(root, 'src/main/views/webpack/js.njk'), 'utf8').match(/src="([^"]+)"/)[1];
  const base = `http://127.0.0.1:${server.address().port}`; const results = {};
  for (const endpoint of ['/ui-preview', '/ui-preview/', '/ui-preview?UI_PREVIEW_ENABLED=true', '/ui-preview-other', '/ui-preview/nested', '/%75i-preview', '/UI-PREVIEW', '/dashboard', asset]) {
    const response = await fetch(base + endpoint, {redirect: 'manual'});
    results[endpoint] = {status: response.status, cookie: response.headers.get('set-cookie'), location: response.headers.get('location'), marker: response.headers.get('x-ui-preview'), body: (await response.text()).slice(0, 30)};
  }
  const method = await fetch(base + '/ui-preview', {method: 'POST', redirect: 'manual'});
  const keys = await app.locals.draftStoreClient.keys('*9601*');
  console.log('PROBE ' + JSON.stringify({results, asset, methodStatus: method.status, previewKeys: keys, ready: !!app.locals.uiPreviewReady}));
  await new Promise(resolve => server.close(resolve)); app.locals.draftStoreClient.disconnect();
})().catch(error => {console.error(error); process.exitCode = 1;});
