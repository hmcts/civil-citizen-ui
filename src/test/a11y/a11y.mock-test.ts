import * as fs from 'fs';
import * as urls from 'routes/urls';
import {IGNORED_URLS} from './ignored-urls';
import {fail} from 'assert';
import supertest from 'supertest';
import {translateUrlToFilePath} from '../utils/mocks/a11y/urlToFileName';

const urlsList = getChunkAtIndex(Object.values(urls).filter(url => !IGNORED_URLS.includes(url)), parseInt(process.env.A11Y_CHUNKS ?? '1'), parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0'));
const pa11y = require('pa11y');
import {retry} from '../functionalTests/specClaimHelpers/api/retryHelper.js';

const os = require('os');

const networkInterfaces = os.networkInterfaces();

console.log(networkInterfaces);

// Create a Pa11y test server with Node.js and Express
const express = require('express');
const port = 3000 + parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0');
const app = express();

class PallyIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: string;
  typeCode: number;
}

const server = app.listen(port, () => {
  console.log(`Pa11y test server listening at http://localhost:${port}`);
});
const agent = supertest.agent(app);

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

// Run the Pa11y tests against the test server
describe('Accessibility', async () => {

  const options = {
    hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
    standard:'WCAG2AA',
    reportName: '',
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

  for (let url of urlsList) {
    it('Test of '+url,async () => {
      app.get(url, (req: any, res: any) => {
        url = url.replace(':id', '1645882162449409').replace(':appId', '1720536653906339');
        const filePath = translateUrlToFilePath(url);
        const fileContent = fs.readFileSync(filePath,  'utf8');
        res.send(fileContent);
      });

      await retry(async () => {
        const messages = await pa11y(agent.get(url).url, options);
        messages.documentTitle == 'Error' ? fail('This page was titled "error", which suggests it did not render correctly.') : null;
        expectNoErrors(messages.issues);
      });
    });
  }
  server.close();
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