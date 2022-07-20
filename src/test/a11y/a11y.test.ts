import * as supertest from 'supertest';
import * as urls from '../../main/routes/urls';
import config from 'config';
import nock from 'nock';
import {app} from '../../main/app';
import {fail} from 'assert';
import {IGNORED_URLS} from './ignored-urls';
import {mockCivilClaim} from '../utils/mockDraftStore';
import {CIVIL_SERVICE_CALCULATE_DEADLINE} from '../../main/app/client/civilServiceUrls';

jest.mock('../../main/modules/oidc');
jest.mock('../../main/modules/draft-store');

const pa11y = require('pa11y');
app.locals.draftStoreClient = mockCivilClaim;
const agent = supertest.agent(app);
const urlsList = Object.values(urls).filter(url => !IGNORED_URLS.includes(url));

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

async function runPally(url: string, actions: string[]): Promise<Pa11yResult> {
  const PAGE_URL = url.replace(':id', '1645882162449409');
  return await pa11y(PAGE_URL, {
    // Ignore GovUK template elements that are outside the team's control from a11y tests
    hideElements: '#logo, .logo, .copyright, link[rel=mask-icon]',
    actions,
    chromeLaunchConfig: {
      args: ['--no-sandbox'],
    },
  });
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

function testAccessibilityWithActions(url: string, actions: string[]): void {
  describe(`Page ${url}`, () => {
    test(`should have no accessibility errors ${(actions.length) ? 'with actions': ''}`, done => {
      ensurePageCallWillSucceed(url)
        .then(() => runPally(agent.get(url).url, actions))
        .then((result: Pa11yResult) => {
          expectNoErrors(result.issues);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });
}

function testAccessibility(url: string): void {
  testAccessibilityWithActions(url, []);
}

describe('Accessibility', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200,  new Date(2022, 9, 31));
  });

  urlsList.forEach((url) => {
    testAccessibility(url);
  });
});
