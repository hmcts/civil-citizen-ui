import { fail } from 'assert';
const pa11y = require('pa11y');
import * as supertest from 'supertest';
import { app } from '../../main/app';
import * as urls from '../../main/routes/urls';

const agent = supertest.agent(app);
const IGNORED_URLS = [urls.SIGN_IN_URL, urls.SIGN_OUT_URL, urls.CASES_URL, urls.CALLBACK_URL, urls.DASHBOARD_URL, urls.UNAUTHORISED_URL, urls.CITIZEN_PHONE_NUMBER_URL, urls.UNAUTHORISED_URL,urls.CITIZEN_DETAILS_URL, urls.CLAIM_DETAILS_URL, urls.DOB_URL,  urls.AGE_ELIGIBILITY_URL, urls.CITIZEN_RESPONSE_TYPE,urls.POSTCODE_LOOKUP_URL,urls.ROOT_URL, urls.HOME_URL, urls.CITIZEN_BANK_ACCOUNT_URL, urls.CITIZEN_SEVERELY_DISABLED_URL, urls.BASE_CASE_RESPONSE_URL, urls.CONFIRM_CITIZEN_DETAILS_URL];
const urlsNoSignOut = Object.values(urls).filter(url => !IGNORED_URLS.includes(url));


class Pa11yResult {
  documentTitle: string;
  pageUrl: string;
  issues: PallyIssue[];
}

class PallyIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: string;
  typeCode: number;
}

beforeAll((done /* call it or remove it*/) => {
  done(); // calling it
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.setTimeout(100000);
});

afterEach(() => {
  jest.clearAllTimers();
});

function ensurePageCallWillSucceed(url: string): Promise<void> {
  return agent.get(url).then((res: supertest.Response) => {
    if (res.redirect && res.get('Location') === 'login') {
      throw new Error(
        `Call to ${url} resulted in a redirect to ${res.get('Location')}`,
      );
    }
    if (res.serverError) {
      throw new Error(`Call to ${url} resulted in internal server error`);
    }
  });
}

async function runPally(url: string): Promise<Pa11yResult> {
  const pa11yResult = await pa11y(url, {
    includeWarnings: true,
    // Ignore GovUK template elements that are outside the team's control from a11y tests
    hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
    chromeLaunchConfig: {
      args: ['--no-sandbox'],
    },
  });
  return pa11yResult;
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}
describe('check URLs for accessibility errors', () => {
  if (urlsNoSignOut.length > 0 ) {
    describe.each(urlsNoSignOut)('Page %s', url => {
      test('should have no accessibility errors', async () => {
        await ensurePageCallWillSucceed(url);
        const result = await runPally(agent.get(url).url);
        expect(result.issues).toEqual(expect.any(Array));
        expectNoErrors(result.issues);
      });
    });
  } else {
    it('does nothing', async () => {
      //see https://github.com/facebook/jest/issues/5783#issuecomment-450626450
    });
  }
});
