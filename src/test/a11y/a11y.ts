//import { fail } from 'assert';
const pa11y = require('pa11y');
import * as supertest from 'supertest';
import { app } from '../../main/app';
import * as urls from '../../main/routes/urls';
const agent = supertest.agent(app);
const IGNORED_URLS = [urls.SIGN_IN_URL, urls.SIGN_OUT_URL,urls.CASES_URL,urls.CALLBACK_URL,urls.DASHBOARD_URL,urls.UNAUTHORISED_URL];
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
function runPally(url: string): Pa11yResult {
  return pa11y(url, {
    hideElements: '.govuk-footer__licence-logo, .govuk-header__logotype-crown',
  });
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

describe.each(urlsNoSignOut)('Page %s', url => {
  test('should have no accessibility errors', async () => {
    await ensurePageCallWillSucceed(url);
    const result = await runPally(url);
    expect(result.issues).toEqual(expect.any(Array));
    expectNoErrors(result.issues);
  });
});
