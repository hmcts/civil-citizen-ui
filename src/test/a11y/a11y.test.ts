import * as supertest from 'supertest';
import * as urls from '../../main/routes/urls';
import config from 'config';
import nock from 'nock';
import {app} from '../../main/app';
import {fail} from 'assert';
import {IGNORED_URLS} from './ignored-urls';
import {mockCivilClaim} from '../utils/mockDraftStore';
import CivilClaimResponseMock from '../utils/mocks/civilClaimResponseMock.json';
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
    standard:'WCAG2AA',
    includeWarnings: true,
    chromeLaunchConfig: {
      args: ['--no-sandbox'],
      ignoreHTTPSErrors: true,
    },
    threshold: 10,
  });
}

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

function expectNoPerceivableWarnings(messages: PallyIssue[]): void {
  const nonTextContent  = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_1'));
  if (nonTextContent.length > 0) {
    const errorsAsJson = `${JSON.stringify(nonTextContent, null, 2)}`;
    fail(`There are non text content Guideline 1.1.1 issues: \n${errorsAsJson}\n`);
  }
}

function expectNoAdaptableWarnings(messages: PallyIssue[]): void {
  //const info  = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_3.1_3_1') && !m.context.includes('govuk-header__menu-button')&& !m.context.includes('govuk-cookie-banner__heading')&& !m.context.includes('class="govuk-heading-m">Email<')&& !m.context.includes('govuk-details__text'));
  const meaningful = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_3.1_3_2'));
  const sensory = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_3.1_3_3'));
  const orientation = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_3.1_3_4'));
  //const identifyInput = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_3.1_3_5'));
  /*if (info.length > 0) {
    const errorsAsJson = `${JSON.stringify(info, null, 2)}`;
    fail(`There are parsing Guideline 1.3.1 issues: \n${errorsAsJson}\n`);
  }*/
  if (meaningful.length > 0) {
    const errorsAsJson = `${JSON.stringify(meaningful, null, 2)}`;
    fail(`There are instructions Guideline 1.3.2 issues: \n${errorsAsJson}\n`);
  }
  if (sensory.length > 0) {
    const errorsAsJson = `${JSON.stringify(sensory, null, 2)}`;
    fail(`There are suggestion Guideline 1.3.3 issues: \n${errorsAsJson}\n`);
  }
  if (orientation.length > 0) {
    const errorsAsJson = `${JSON.stringify(orientation, null, 2)}`;
    fail(`There are parsing Guideline 1.3.4 issues: \n${errorsAsJson}\n`);
  }
  /*if (identifyInput.length > 0) {
    const errorsAsJson = `${JSON.stringify(identifyInput, null, 2)}`;
    fail(`There are instructions Guideline 1.3.5 issues: \n${errorsAsJson}\n`);
  }*/
}

function expectNoDistinguishableWarnings(messages: PallyIssue[]): void {
  const useColor  = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_1'));
  //const contracts = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_3'));
  const resizeText = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_4'));
  const reflow  = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_10'));
  const nonTextContracts = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_11'));
  const content = messages.filter(m => m.code.includes('WCAG2AA.Principle1.Guideline1_4.1_4_12'));
  if (useColor.length > 0) {
    const errorsAsJson = `${JSON.stringify(useColor, null, 2)}`;
    fail(`There are identification Guideline 1.4.1 issues: \n${errorsAsJson}\n`);
  }
  /*if (contracts.length > 0) {
    const errorsAsJson = `${JSON.stringify(contracts, null, 2)}`;
    fail(`There are instruction Guideline 1.4.3 issues: \n${errorsAsJson}\n`);
  }*/
  if (resizeText.length > 0) {
    const errorsAsJson = `${JSON.stringify(resizeText, null, 2)}`;
    fail(`There are suggestion Guideline 1.4.4 issues: \n${errorsAsJson}\n`);
  }
  if (reflow.length > 0) {
    const errorsAsJson = `${JSON.stringify(reflow, null, 2)}`;
    fail(`There are parsing Guideline 1.4.10 issues: \n${errorsAsJson}\n`);
  }
  if (nonTextContracts.length > 0) {
    const errorsAsJson = `${JSON.stringify(nonTextContracts, null, 2)}`;
    fail(`There are instructions Guideline 1.4.11 issues: \n${errorsAsJson}\n`);
  }
  if (content.length > 0) {
    const errorsAsJson = `${JSON.stringify(content, null, 2)}`;
    fail(`There are suggestion Guideline 1.4.12 issues: \n${errorsAsJson}\n`);
  }
}

function expectNoKeyboardAccesibleWarnings(messages: PallyIssue[]): void {
  const keyboard  = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_1.2_1_1'));
  const noKeyboard = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_1.2_1_2'));
  const character = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_1.2_1_3'));
  if (keyboard.length > 0) {
    const errorsAsJson = `${JSON.stringify(keyboard, null, 2)}`;
    fail(`There are keyboard Guideline 2.1.1 issues: \n${errorsAsJson}\n`);
  }
  if (noKeyboard.length > 0) {
    const errorsAsJson = `${JSON.stringify(noKeyboard, null, 2)}`;
    fail(`There are no keyboard trap Guideline 2.1.2 issues: \n${errorsAsJson}\n`);
  }
  if (character.length > 0) {
    const errorsAsJson = `${JSON.stringify(character, null, 2)}`;
    fail(`There are character key shortcuts Guideline 2.1.3 issues: \n${errorsAsJson}\n`);
  }
}
function expectNavigableWarnings(messages: PallyIssue[]): void {
  const bypass = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_1'));
  const pageTitled = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_2'));
  const focusOrder = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_3'));
  const linkPurpose  = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_4'));
  const multipleWays = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_5'));
  const heading = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_6'));
  const focus = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_4.2_4_7'));
  if (bypass.length > 0) {
    const errorsAsJson = `${JSON.stringify(bypass, null, 2)}`;
    fail(`There are bypass blocks Guideline 2.4.1 issues: \n${errorsAsJson}\n`);
  }
  if (pageTitled.length > 0) {
    const errorsAsJson = `${JSON.stringify(pageTitled, null, 2)}`;
    fail(`There are page titled Guideline 2.4.2 issues: \n${errorsAsJson}\n`);
  }
  if (focusOrder.length > 0) {
    const errorsAsJson = `${JSON.stringify(focusOrder, null, 2)}`;
    fail(`There are focus order Guideline 2.4.3 issues: \n${errorsAsJson}\n`);
  }
  if (linkPurpose.length > 0) {
    const errorsAsJson = `${JSON.stringify(linkPurpose, null, 2)}`;
    fail(`There are clink purpose Guideline 2.4.4 issues: \n${errorsAsJson}\n`);
  }
  if (multipleWays.length > 0) {
    const errorsAsJson = `${JSON.stringify(multipleWays, null, 2)}`;
    fail(`There are multiple ways Guideline 2.4.5 issues: \n${errorsAsJson}\n`);
  }
  if (heading.length > 0) {
    const errorsAsJson = `${JSON.stringify(heading, null, 2)}`;
    fail(`There are cheadings and labels Guideline 2.4.6 issues: \n${errorsAsJson}\n`);
  }
  if (focus.length > 0) {
    const errorsAsJson = `${JSON.stringify(focus, null, 2)}`;
    fail(`There are focus visible Guideline 2.4.7 issues: \n${errorsAsJson}\n`);
  }
}

function expectNoInputModalitiesWarnings(messages: PallyIssue[]): void {
  const pointerGestures  = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_5.2_5_1'));
  const pointerCancellation = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_5.2_5_2'));
  const labelInName = messages.filter(m => m.code.includes('WCAG2AA.Principle2.Guideline2_5.2_5_3'));
  if (pointerGestures.length > 0) {
    const errorsAsJson = `${JSON.stringify(pointerGestures, null, 2)}`;
    fail(`There are parsing Guideline 2.5.1 issues: \n${errorsAsJson}\n`);
  }
  if (pointerCancellation.length > 0) {
    const errorsAsJson = `${JSON.stringify(pointerCancellation, null, 2)}`;
    fail(`There are instructions Guideline 2.5.2 issues: \n${errorsAsJson}\n`);
  }
  if (labelInName.length > 0) {
    const errorsAsJson = `${JSON.stringify(labelInName, null, 2)}`;
    fail(`There are suggestion Guideline 2.5.3 issues: \n${errorsAsJson}\n`);
  }
}
function expectNoReadableWarnings(messages: PallyIssue[]): void {
  const languajePage = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_1.3_1_1'));
  const languajePart = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_1.3_1_2'));
  const onFocus = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_2.3_2_1'));
  const onInput  = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_2.3_2_2'));
  const consistentNavigation = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_2.3_2_3'));
  const consistentIdentification = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_2.3_2_4'));
  if (languajePage.length > 0) {
    const errorsAsJson = `${JSON.stringify(languajePage, null, 2)}`;
    fail(`There are language page Guideline 3.1.1 issues: \n${errorsAsJson}\n`);
  }
  if (languajePart.length > 0) {
    const errorsAsJson = `${JSON.stringify(languajePart, null, 2)}`;
    fail(`There are language part Guideline 3.1.2 issues: \n${errorsAsJson}\n`);
  }
  if (onFocus.length > 0) {
    const errorsAsJson = `${JSON.stringify(onFocus, null, 2)}`;
    fail(`There are on focus Guideline 3.2.1 issues: \n${errorsAsJson}\n`);
  }
  if (onInput.length > 0) {
    const errorsAsJson = `${JSON.stringify(onInput, null, 2)}`;
    fail(`There are on input Guideline 3.2.2 issues: \n${errorsAsJson}\n`);
  }
  if (consistentNavigation.length > 0) {
    const errorsAsJson = `${JSON.stringify(consistentNavigation, null, 2)}`;
    fail(`There are consistent navigation Guideline 3.2.3 issues: \n${errorsAsJson}\n`);
  }
  if (consistentIdentification.length > 0) {
    const errorsAsJson = `${JSON.stringify(consistentIdentification, null, 2)}`;
    fail(`There are consistent identification Guideline 3.2.4 issues: \n${errorsAsJson}\n`);
  }
}

function expectNoInputAssistanceWarnings(messages: PallyIssue[]): void {
  const identification  = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_3.3_3_1'));
  const instructions = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_3.3_3_2'));
  const suggestion = messages.filter(m => m.code.includes('WCAG2AA.Principle3.Guideline3_3.3_3_3'));
  if (identification.length > 0) {
    const errorsAsJson = `${JSON.stringify(identification, null, 2)}`;
    fail(`There are parsing Guideline 3.3.1 issues: \n${errorsAsJson}\n`);
  }
  if (instructions.length > 0) {
    const errorsAsJson = `${JSON.stringify(instructions, null, 2)}`;
    fail(`There are instructions Guideline 3.3.2 issues: \n${errorsAsJson}\n`);
  }
  if (suggestion.length > 0) {
    const errorsAsJson = `${JSON.stringify(suggestion, null, 2)}`;
    fail(`There are suggestion Guideline 3.3.3 issues: \n${errorsAsJson}\n`);
  }
}
function expectNoRobustWarnings(messages: PallyIssue[]): void {
  const parsing = messages.filter(m => m.code.includes('WCAG2AA.Principle4.Guideline4_1.4_1_1'));
  //const nameRole = messages.filter(m => m.code.includes('WCAG2AA.Principle4.Guideline4_1.4_1_2')); // && !m.context.includes('govuk-footer__link'));
  const status = messages.filter(m => m.code.includes('WCAG2AA.Principle4.Guideline4_1.4_1_3'));
  if (parsing.length > 0) {
    const errorsAsJson = `${JSON.stringify(parsing, null, 2)}`;
    fail(`There are parsing Guideline 4.1.1 issues: \n${errorsAsJson}\n`);
  }
  /*if (nameRole.length > 0) {
    const errorsAsJson = `${JSON.stringify(nameRole, null, 2)}`;
    fail(`There are name Role Guideline 4.1.2 issues: \n${errorsAsJson}\n`);
  }*/
  if (status.length > 0) {
    const errorsAsJson = `${JSON.stringify(status, null, 2)}`;
    fail(`There are status Guideline 4.1.3 issues: \n${errorsAsJson}\n`);
  }
}

function testAccessibilityWithActions(url: string, actions: string[]): void {
  describe(`Page ${url}`, () => {
    it(`should have no accessibility errors ${(actions.length) ? 'with actions' : ''}`, done => {
      ensurePageCallWillSucceed(url)
        .then(() => runPally(agent.get(url).url, actions))
        .then((result: Pa11yResult) => {
          expectNoErrors(result.issues);
          expectNoPerceivableWarnings(result.issues);
          expectNoAdaptableWarnings(result.issues);
          expectNoDistinguishableWarnings(result.issues);
          expectNoKeyboardAccesibleWarnings(result.issues);
          expectNavigableWarnings(result.issues);
          expectNoInputModalitiesWarnings(result.issues);
          expectNoReadableWarnings(result.issues);
          expectNoInputAssistanceWarnings(result.issues);
          expectNoRobustWarnings(result.issues);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });
}

function testAccessibility(url: string): void {
  //we need to add actions for example:
  //          `set field #username to ${email}`,
  //         `set field #password to ${password}`,
  //         'click element .button',
  //         'wait for element .govuk-fieldset__legend--xl to be visible'
  //const action =['click element .govuk-button'];
  //testAccessibilityWithActions(url, action);
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
      .reply(200, new Date(2022, 9, 31));
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, CivilClaimResponseMock)
      .get('/cases/1645882162449409')
      .reply(200, CivilClaimResponseMock);
    nock('http://localhost:4502')
      .post('/lease')
      .reply(200, {});
    nock('http://localhost:8765')
      .get('/drafts')
      .reply(200, {});
  });

  urlsList.forEach((url) => {
    testAccessibility(url);
  });
});
