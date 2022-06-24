import config from 'config';
import nock from 'nock';
import Module from 'module';
import * as checkAnswersService from '../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import * as claimDetailsService from '../../../../../main/modules/claimDetailsService';
import {app} from '../../../../../main/app';
import {CLAIM_TASK_LIST_URL, RESPONSE_CHECK_ANSWERS_URL} from '../../../../../main/routes/urls';
import {
  DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE,
  SIGNER_NAME_REQUIRED,
  SIGNER_ROLE_REQUIRED,
  STATEMENT_OF_TRUTH_REQUIRED_MESSAGE,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {constructResponseUrlWithIdParams} from '../../../../../main/common/utils/urlFormatter';
import {
  createClaimWithBasicRespondentDetails,
  TASK_LISTS,
} from '../../../routes/features/response/checkAnswersController.test';
import {mockRedisWithPaymentAmount} from '../../../../utils/mockDraftStore';
import {QualifiedStatementOfTruth} from '../../../../../main/common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {StatementOfTruthForm} from '../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';

const jsdom = require('jsdom');
const request = require('supertest');
const session = require('supertest-session');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/services/features/response/checkAnswers/checkAnswersService');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/services/features/response/taskListService', () => ({
  ...jest.requireActual('../../../../../main/services/features/response/taskListService') as Module,
  getTaskLists: jest.fn(() => TASK_LISTS),
}));

const mockGetSummarySections = checkAnswersService.getSummarySections as jest.Mock;
const mockGetStatementOfTruth = checkAnswersService.getStatementOfTruth as jest.Mock;
const mockRejectingFullAmount = claimDetailsService.isFullAmountReject as jest.Mock;
mockGetSummarySections.mockImplementation(() => {return createClaimWithBasicRespondentDetails();});

const CLAIM_ID = 'aaa';
const respondentCheckAnswersUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_CHECK_ANSWERS_URL);
app.locals.draftStoreClient = mockRedisWithPaymentAmount;
const testSession = session(app);
const {JSDOM} = jsdom;

describe('Check answers View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach((done) => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    testSession
      .get(constructResponseUrlWithIdParams(CLAIM_ID, CLAIM_TASK_LIST_URL))
      .expect(200)
      .end((err: Error) => {
        return (err) ? done(err) : done();
      });
  });

  describe('on GET', () => {
    describe('respondent type organisation', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        mockGetStatementOfTruth.mockImplementation(() => {return  new QualifiedStatementOfTruth(true);});
        mockRejectingFullAmount.mockImplementation(() => true);
        const response = await testSession.get(respondentCheckAnswersUrl);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should have title set',() => {
        expect(htmlDocument.title).toBe('Your money claims account - Check your answers');
      });

      it('should display header', () => {
        const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
        expect(header.innerHTML).toContain('Check your answers');
      });

      it('should display statement of truth header as last header', () => {
        const header = htmlDocument.getElementsByTagName('legend')[0]
          .getElementsByClassName('govuk-heading-m')[0];
        expect(header.innerHTML).toContain('Statement of truth');
      });

      it('should display information paragraph', () => {
        const expectedParagraph = 'The information on this page forms your response. You can see it on the response form after you submit.';
        const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
        expect(paragraph.innerHTML).toContain(expectedParagraph);
      });

      it('should display sign the statement paragraph', () => {
        const expectedParagraph = 'When you’re satisfied that your answers are accurate, you should tick to "sign" this statement of truth on the form.';
        const paragraph = htmlDocument.getElementsByClassName('govuk-body')[1];
        expect(paragraph.innerHTML).toContain(expectedParagraph);
      });

      it('should display senior position paragraph', () => {
        const expectedParagraph = 'You must hold a senior position in your organisation to sign the statement of truth.';
        const paragraph = htmlDocument.getElementsByClassName('govuk-body')[2];
        expect(paragraph.innerHTML).toContain(expectedParagraph);
      });

      it('should display types of senior position summary', () => {
        const expectedSummary = 'Types of senior position';
        const summary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
        expect(summary.innerHTML).toContain(expectedSummary);
      });

      it('should display full name input', () => {
        const input = htmlDocument.getElementById('signerName');
        const inputLabel = htmlDocument.getElementsByClassName('govuk-label')[0];
        expect(input).toBeTruthy();
        expect(inputLabel.innerHTML).toContain('Full name');
      });

      it('should display job title input', () => {
        const input = htmlDocument.getElementById('signerRole');
        const inputLabel = htmlDocument.getElementsByClassName('govuk-label')[1];
        expect(input).toBeTruthy();
        expect(inputLabel.innerHTML).toContain('Job title');
      });

      it('should display signed checkbox', () => {
        const checkbox = htmlDocument.getElementsByClassName('govuk-checkboxes__input')[0];
        const checkboxLabel = htmlDocument.getElementsByClassName('govuk-checkboxes__label')[0];
        expect(checkbox.getAttribute('name')).toBe('signed');
        expect(checkboxLabel.innerHTML).toContain('I believe that the facts stated in this response are true.');
      });

      it('should display directionsQuestionnaireSigned checkbox', async () => {
        const checkbox = htmlDocument.getElementsByClassName('govuk-checkboxes__input')[1];
        const checkboxLabel = htmlDocument.getElementsByClassName('govuk-checkboxes__label')[1];
        expect(checkbox.getAttribute('name')).toBe('directionsQuestionnaireSigned');
        expect(checkboxLabel.innerHTML).toContain('The hearing requirement details on this page are true to the best of my knowledge.');
      });

      it('should display types of senior position summary', () => {
        const expectedSummary = 'Contact us for help';
        const summary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[1];
        expect(summary.innerHTML).toContain(expectedSummary);
      });

      it('should display submit button', () => {
        const button = htmlDocument.getElementsByClassName('govuk-button')[0];
        expect(button.innerHTML).toContain('Submit Response');
      });
    });

    describe('respondent type individual', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        mockGetStatementOfTruth.mockImplementation(() => {return  new StatementOfTruthForm(false);});
        mockRejectingFullAmount.mockImplementation(() => false);
        const response = await testSession.get(respondentCheckAnswersUrl);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should not display senior position paragraph', () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-body')[2];
        expect(paragraph).toBe(undefined);
      });

      it('should not display types of senior position summary', () => {
        // should only display 1 summary (contact us for help)
        const summaries = htmlDocument.getElementsByClassName('govuk-details__summary-text');
        expect(summaries.length).toBe(1);
      });

      it('should not display full name input', () => {
        const input = htmlDocument.getElementById('signerName');
        expect(input).toBe(null);
      });

      it('should not display job title input', () => {
        const input = htmlDocument.getElementById('signerRole');
        expect(input).toBe(null);
      });

      it('should not display directionsQuestionnaireSigned checkbox', async () => {
        const checkbox = htmlDocument.getElementById('directionsQuestionnaireSigned');
        expect(checkbox).toBe(null);
      });
    });
  });

  describe('on POST', () => {
    describe('respondent type individual', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        mockGetStatementOfTruth.mockImplementation(() => {return  new StatementOfTruthForm(false);});
        mockRejectingFullAmount.mockImplementation(() => false);
        const data = {signed: ''};
        const response = await request(app)
          .post(respondentCheckAnswersUrl)
          .send(data);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary', () => {
        const summary = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
        expect(summary.innerHTML).toContain('There was a problem');
      });

      it('should only display singed error', () => {
        const errors = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0].getElementsByTagName('li');
        const errorMessage  = errors[0];
        expect(errors.length).toBe(1);
        expect(errorMessage.innerHTML).toContain(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
      });
    });

    describe('respondent type organisation', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        mockGetStatementOfTruth.mockImplementation(() => {return new QualifiedStatementOfTruth(true);});
        mockRejectingFullAmount.mockImplementation(() => true);
        const data = {
          type: 'qualified',
          signed: '',
          isFullAmountRejected: 'true',
          directionsQuestionnaireSigned: '',
        };
        const response = await request(app)
          .post(respondentCheckAnswersUrl)
          .send(data);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary', () => {
        const summary = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
        expect(summary.innerHTML).toContain('There was a problem');
      });

      it('should display error messages', () => {
        const errors = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0].getElementsByTagName('li');
        expect(errors.length).toBe(4);
        expect(errors[0].innerHTML).toContain(SIGNER_NAME_REQUIRED);
        expect(errors[1].innerHTML).toContain(SIGNER_ROLE_REQUIRED);
        expect(errors[2].innerHTML).toContain(STATEMENT_OF_TRUTH_REQUIRED_MESSAGE);
        expect(errors[3].innerHTML).toContain(DIRECTION_QUESTIONNAIRE_REQUIRED_MESSAGE);
      });
    });
  });
});
