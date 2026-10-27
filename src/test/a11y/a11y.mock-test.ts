const {before, after, describe, it} = require('mocha');
import {createServer} from 'http';
import {AddressInfo} from 'net';
import * as urls from 'routes/urls';
import {IGNORED_URLS} from './ignored-urls';
import {deepStrictEqual, fail, strictEqual} from 'assert';
import {CaptureServer, captureUrl, startCaptureServer} from './captureServer';
import {CAPTURE_ATTEMPT_TIMEOUT_MS, CAPTURE_TEST_TIMEOUT_MS, CAPTURE_WORK_TIMEOUT_MS, retryCapture, withCapturePage} from './captureBrowser';

const urlsList = getChunkAtIndex(Object.values(urls).filter(url => !IGNORED_URLS.includes(url)), parseInt(process.env.A11Y_CHUNKS ?? '1'), parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0'));
const pa11y = require('pa11y');

const os = require('os');

const networkInterfaces = os.networkInterfaces();

console.log(networkInterfaces);

class PallyIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: string;
  typeCode: number;
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

// Run the Pa11y tests against the test server
describe('Accessibility', () => {
  let server: CaptureServer;
  before(async () => {
    server = await startCaptureServer([...new Set([...urlsList, urls.CCJ_DEFENDANT_DOB_URL])], {port: 3000 + parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0')});
  });
  after(async () => {
    await server?.close();
  });

  const options = {
    hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
    standard:'WCAG2AA',
    includeWarnings: true,
    log: {
      debug: console.log,
      error: console.error,
      info: console.info,
    },
  };

  it('initializes GOV.UK radios and preserves values through native conditional interaction', async () => {
    await withCapturePage(server.baseUrl + captureUrl(urls.CCJ_DEFENDANT_DOB_URL), async page => {
      await page.waitForSelector('[data-module="govuk-radios"][data-govuk-radios-init]', {timeout: 5000});
      strictEqual(await page.$eval('body', body => body.classList.contains('govuk-frontend-supported')), true);
      const values = await page.$$eval('#conditional-option input', fields => fields.map(field => [(field as HTMLInputElement).name, (field as HTMLInputElement).value]));
      strictEqual(await page.$eval('#conditional-option', panel => getComputedStyle(panel).display), 'none');
      strictEqual(await page.$eval('#option', input => input.getAttribute('aria-expanded')), 'false');
      await page.click('label[for="option"]');
      strictEqual(await page.$eval('#option', input => (input as HTMLInputElement).checked), true);
      strictEqual(await page.$eval('#option', input => input.getAttribute('aria-expanded')), 'true');
      strictEqual(await page.$eval('#conditional-option', panel => getComputedStyle(panel).display === 'none'), false);
      await page.click('label[for="option-2"]');
      strictEqual(await page.$eval('#option-2', input => (input as HTMLInputElement).checked), true);
      strictEqual(await page.$eval('#option', input => input.getAttribute('aria-expanded')), 'false');
      strictEqual(await page.$eval('#conditional-option', panel => getComputedStyle(panel).display), 'none');
      deepStrictEqual(await page.$$eval('#conditional-option input', fields => fields.map(field => [(field as HTMLInputElement).name, (field as HTMLInputElement).value])), values);
    });
  }).timeout(CAPTURE_ATTEMPT_TIMEOUT_MS + 5_000);

  it('blocks off-origin requests while keeping capture assets available', async () => {
    let foreignRequests = 0;
    const foreign = createServer((_req, res) => {
      foreignRequests++;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end('This must not be requested by the capture browser');
    });
    await new Promise<void>((resolve, reject) => {
      foreign.once('error', reject);
      foreign.listen(0, '127.0.0.1', resolve);
    });
    try {
      const foreignUrl = `http://127.0.0.1:${(foreign.address() as AddressInfo).port}/external-resource`;
      await withCapturePage(server.baseUrl + captureUrl(urls.CCJ_DEFENDANT_DOB_URL), async page => {
        const loaded = await page.evaluate(url => fetch(url).then(() => true, () => false), foreignUrl);
        strictEqual(loaded, false);
        strictEqual(foreignRequests, 0);
        strictEqual(await page.evaluate(() => fetch('/main-dev.css').then(response => response.status)), 200);
      });
    } finally {
      foreign.closeAllConnections();
      await new Promise<void>((resolve, reject) => foreign.close(error => error ? reject(error) : resolve()));
    }
  }).timeout(CAPTURE_ATTEMPT_TIMEOUT_MS + 5_000);

  for (const url of urlsList) {
    it('Test of '+url, async () => {
      const target = server.baseUrl + captureUrl(url);
      const messages = await retryCapture(() => withCapturePage(target, (page, browser) => pa11y(target, {
        ...options, page, browser, ignoreUrl: true, timeout: CAPTURE_WORK_TIMEOUT_MS,
      }))) as {documentTitle: string; issues: PallyIssue[]};
      // Retry browser/scan failures, not completed accessibility assertions.
      if (messages.documentTitle === 'Error') fail('This page was titled "error", which suggests it did not render correctly.');
      expectNoErrors(messages.issues);
    }).timeout(CAPTURE_TEST_TIMEOUT_MS);
  }
});

function getChunkAtIndex(array: string[], numChunks: number, index: number) {
  console.log('numChunks ' + numChunks);
  console.log('index ' + index);

  if (!Array.isArray(array) || numChunks <= 0 || index < 0 || index >= numChunks) {
    throw new Error('Invalid input: Provide a valid array, a positive number of chunks, and a valid index.');
  }

  const chunkSize = Math.floor(array.length / numChunks);
  const remainder = array.length % numChunks;

  const start = index * chunkSize + Math.min(index, remainder);

  const end = start + chunkSize + (index < remainder ? 1 : 0);

  return array.slice(start, end);
}
