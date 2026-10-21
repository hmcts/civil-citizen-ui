// Real application/controller/template sweep. Infrastructure is synthetic;
// OIDC policy, guards, CSRF registration and template assembly are unchanged.
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const {isolatedEnvironment} = require(path.join(root, 'bin/ui-preview.cjs'));
Object.assign(process.env, isolatedEnvironment('http://127.0.0.1:1', process.env.TMPDIR), {UI_PREVIEW_FIXTURE_NOW: '2026-10-20T12:00:00Z'});
require(path.join(root, 'bin/ui-preview-network.cjs'));
require(path.join(root, 'node_modules/ts-node/register/transpile-only'));
require(path.join(root, 'node_modules/tsconfig-paths/register'));
const express = require(path.join(root, 'node_modules/express'));
const {JSDOM} = require(path.join(root, 'node_modules/jsdom'));
const render = express.response.render;
express.response.render = function (view, ...args) { this.setHeader('X-Preview-Test-View', view); return render.call(this, view, ...args); };
const {createPreviewStubServer} = require(path.join(root, 'bin/ui-preview-stubs.cjs'));
(async () => {
  const stub = createPreviewStubServer(); await new Promise(resolve => stub.listen(0, '127.0.0.1', resolve));
  const serviceUrl = `http://127.0.0.1:${stub.address().port}`;
  // Configure clients before importing the real app/config singleton.
  process.env.NODE_CONFIG = isolatedEnvironment(serviceUrl, process.env.TMPDIR).NODE_CONFIG;
  const {app} = require(path.join(root, 'src/main/app'));
  const {getUiPreviewPageCatalog} = require(path.join(root, 'src/main/services/features/uiPreview/pageCatalog'));
  const {seedUiPreviewFixtures} = require(path.join(root, 'src/main/modules/e2eConfiguration/uiPreviewFixtures'));
  const baseline = require(path.join(root, 'src/main/modules/e2eConfiguration/redisData.json'));
  const ga = require(path.join(root, 'src/main/modules/e2eConfiguration/gaRedisData.json'));
  const expected = require(path.join(root, 'src/main/services/features/uiPreview/pageCatalogVerification.json'));
  await app.locals.uiPreviewReady;
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const pages = getUiPreviewPageCatalog().flatMap(group => group.pages).filter(page => page.status === 'ready');
  const failures = []; let count = 0;
  const cookies = new Map();
  const request = async (url, language, options = {}) => {
    cookies.set('lang', language); cookies.set('eligibilityCompleted', 'true');
    const response = await fetch(`http://127.0.0.1:${server.address().port}${url}`, {
      ...options, redirect: 'manual',
      headers: {...options.headers, Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; ')},
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0]; const separator = pair.indexOf('=');
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return {response, html: await response.text()};
  };
  const inspect = (html, callback) => {
    const dom = new JSDOM(html);
    try {return callback(dom.window.document);} finally {dom.window.close();}
  };
  const fields = html => inspect(html, document => [...document.querySelectorAll('form input[name],form select[name],form textarea[name]')]
    .filter(input => !['file', 'submit', 'button'].includes(input.type) && (!['checkbox', 'radio'].includes(input.type) || input.checked))
    .map(input => [input.name, input.value]));
  const uploadAction = html => inspect(html, document => document.querySelector('form[enctype="multipart/form-data"]').getAttribute('action'));
  const checkPage = async (page, language, mode) => {
    const {response, html} = await request(page.path, language); count++;
    try {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-preview-test-view'), expected[page.path].view);
      assert.doesNotMatch(html, /googletagmanager|js-cdn\.dynatrace|vcc-eu4\.8x8/);
      inspect(html, document => {
        const text = document.querySelector('main').textContent;
        assert.doesNotMatch(text, /£\s*(NaN|undefined)/);
        if (page.path === '/case/1645882162449601/ccj/check-and-send') {
          assert.match(text, /Defendant House/); assert.match(text, /RG4 7AD/);
        }
        if (page.path === '/case/1645882162449602/claimant-response/settle-admitted') assert.match(text, /£400/);
        if (page.path === '/dashboard/1645882162449409/defendant') {
          const destinations = [...document.querySelectorAll('main a[href]')].map(link => link.getAttribute('href'));
          assert.equal(destinations.some(href => href.includes('1645882162449603')), false);
        }
      });
    } catch (error) {
      failures.push({path: page.path, language, mode, status: response.status, error: error.message});
    }
  };
  let journeys = 0;
  try {
    // Isolated catalogue coverage and ordinary browsing are different contracts.
    for (const mode of ['isolated', 'sequential']) for (const language of ['en', 'cy']) {
      await seedUiPreviewFixtures(app.locals.draftStoreClient, baseline, ga);
      cookies.clear();
      for (const page of pages) {
        if (mode === 'isolated') await seedUiPreviewFixtures(app.locals.draftStoreClient, baseline, ga);
        await checkPage(page, language, mode);
      }
    }
    for (const language of ['en', 'cy']) {
      await seedUiPreviewFixtures(app.locals.draftStoreClient, baseline, ga); cookies.clear();
      // Even a direct visit to the old wrong-role dashboard must not turn the
      // following response timeline into a 500 through an incomplete stub model.
      for (const url of [
        '/case/1645882162449409/response/timeline',
        '/dashboard/1645882162449409/claimantNewDesign',
        '/case/1645882162449409/response/timeline',
      ]) assert.equal((await request(url, language)).response.status, 200);
      journeys++;

      // Check-and-send needs an upload draft. Re-enter the real upload journey
      // after dashboard refresh, using its CSRF, selection and multipart controls.
      const cp = '/case/1645882162449603/case-progression';
      assert.equal((await request('/dashboard/1645882162449603/claimantNewDesign', language)).response.status, 200);
      const typesPath = require(path.join(root, 'src/main/routes/urls')).TYPES_OF_DOCUMENTS_URL.replace(':id', '1645882162449603');
      const types = await request(typesPath, language);
      assert.equal(types.response.status, 200);
      const selected = new URLSearchParams(fields(types.html));
      for (const key of [...selected.keys()]) if (key !== '_csrf') selected.delete(key);
      selected.set('list', 'true');
      const choice = await request(typesPath, language, {
        method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: selected.toString(),
      });
      assert.equal(choice.response.status, 302);
      const uploadPath = choice.response.headers.get('location');
      const upload = await request(uploadPath, language);
      assert.equal(upload.response.status, 200);
      const form = new FormData();
      for (const [name, value] of fields(upload.html)) form.append(name, value);
      form.set('action', 'disclosureList[0][uploadButton]');
      form.set('disclosureList[0][fileUpload]', new Blob(['%PDF-1.4\nPreview evidence\n%%EOF'], {type: 'application/pdf'}), 'preview-evidence.pdf');
      const saved = await request(uploadAction(upload.html), language, {method: 'POST', body: form});
      assert.equal(saved.response.status, 200);
      const next = new FormData();
      for (const [name, value] of fields(saved.html)) next.append(name, value);
      const continued = await request(uploadAction(saved.html), language, {method: 'POST', body: next});
      assert.equal(continued.response.status, 302);
      assert.equal(continued.response.headers.get('location'), `${cp}/check-and-send`);
      const summary = await request(`${cp}/check-and-send`, language);
      assert.equal(summary.response.status, 200);
      assert.match(summary.html, /synthetic-upload\.pdf/);
      journeys++;
    }
    console.log('ROUTE_PROBE ' + JSON.stringify({count, pages: pages.length, journeys, failures}));
    if (failures.length) process.exitCode = 1;
  } finally {
    await new Promise(resolve => server.close(resolve)); await new Promise(resolve => stub.close(resolve)); app.locals.draftStoreClient.disconnect();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
