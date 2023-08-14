/* eslint-disable */
import {fail} from 'assert';

import {PageUrls} from './constants';

const pa11y = require('pa11y');

const envUrl = process.env.TEST_URL || 'http://localhost:3001';
const options = ['WCAG2AA.Principle1.Guideline1_3.1_3_1.H42.2'];
// Ignore pages that are passing in WAVE evaluation tool
// const ignoredPages = [''];
import {IGNORED_URLS} from './ignored-urls';

const cuiCaseReference = '1645882162449409';
const cuiCaseProgressionCaseReference = '1645882162449409';

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

function testAccessibility(url: string): void {
  describe(`Page ${url}`, () => {
    it('should have no accessibility errors', async () => {
      if (!IGNORED_URLS.includes(url)) {
        if (url.includes(':cuiCaseId')) {
          url = url.replace(':cuiCaseId', cuiCaseReference);
        } else if (url.includes(':caseProgressionCaseId')) {
          url = url.replace(':cuiCaseId', cuiCaseProgressionCaseReference);
        }
        const pageUrl = envUrl + url;
        const messages = await pa11y(pageUrl, {
          ignore: options,
        });
        expectNoErrors(messages.issues);
      }
    });
  });
}

describe('Accessibility', async () => {
  Object.values({...PageUrls}).forEach(url => {
    testAccessibility(url);
  });
});
