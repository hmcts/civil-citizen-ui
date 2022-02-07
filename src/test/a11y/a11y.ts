import { fail } from 'assert';
import * as supertest from 'supertest';
import { app } from '../../main/app';
import request from 'supertest';

const pa11y = require('pa11y');
const nock = require('nock');

const agent = request.agent(app);

function authenticate() {
  return async () =>
    agent.get('/oauth2/callback')
      .query('code=ABC')
      .then((res) => {
        expect(res.status).toBe(302);
      });
}

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
    if (res.redirect) {
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

function testAccessibility(url: string): void {
  describe(`Page ${url}`, async () => {
    const citizenRoleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NUb2tlbiI6InRva2VuIiwic3ViIjoianNAdGVzdC5jb20iLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiU21pdGgiLCJ1aWQiOiIxMjMiLCJyb2xlcyI6WyJjaXZpbC1jaXRpemVuIl19.Ra3lo2bgl_mmiK8tHMVpBNf6mOTXDXUturb4Wy9ZbJc';

    beforeEach(() => {
      nock('http://localhost:5000')
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
    });

    test('Authenticate Callback', authenticate());
    test('should have no accessibility errors', done => {
      ensurePageCallWillSucceed(url)
        .then(() => runPally(agent.get(url).url))
        .then((result: Pa11yResult) => {
          expectNoErrors(result.issues);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });
}

describe('Accessibility', () => {
  // testing accessibility of the home page
  testAccessibility('/');
  // testAccessibility('/case/1643033241924739/response/claim-details');
  // TODO: include each path of your application in accessibility checks
});
