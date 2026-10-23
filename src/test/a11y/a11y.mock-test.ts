const {before, after} = require('mocha');
import * as urls from 'routes/urls';
import {IGNORED_URLS} from './ignored-urls';
import {fail} from 'assert';
import {CaptureServer, captureUrl, startCaptureServer} from './captureServer';

const urlsList = getChunkAtIndex(Object.values(urls).filter(url => !IGNORED_URLS.includes(url)), parseInt(process.env.A11Y_CHUNKS ?? '1'), parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0'));
const pa11y = require('pa11y');
import {retry} from '../functionalTests/specClaimHelpers/api/retryHelper.js';

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
    server = await startCaptureServer(urlsList, {port: 3000 + parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0')});
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
    chromeLaunchConfig: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    },
  };

  for (const url of urlsList) {
    it('Test of '+url, async () => {
      await retry(async () => {
        const messages = await pa11y(server.baseUrl + captureUrl(url), options);
        messages.documentTitle == 'Error' ? fail('This page was titled "error", which suggests it did not render correctly.') : null;
        expectNoErrors(messages.issues);
      });
    });
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
