import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIMANT_DOB_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claimant Date of Birth View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(async () => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      const response = await request(app).get(CLAIMANT_DOB_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Your date of birth');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('What is your date of birth');
    });

    it('should display date input hint', () => {
      const today = new Date();
      const hint = htmlDocument.getElementsByClassName('govuk-hint')[0];
      expect(hint.innerHTML).toContain(`For Example, ${today.getDate()} ${today.getMonth()} ${today.getFullYear() - 18}`);
    });

    it('should display date inputs', () => {
      const dateInputs = htmlDocument.getElementsByClassName('govuk-date-input__input');
      const dateLabels = htmlDocument.getElementsByClassName('govuk-date-input__label');
      expect(dateInputs.length).toBe(3);
      expect(dateInputs[0].getAttribute('name')).toBe('day');
      expect(dateInputs[1].getAttribute('name')).toBe('month');
      expect(dateInputs[2].getAttribute('name')).toBe('year');
      expect(dateLabels[0].innerHTML).toContain('Day');
      expect(dateLabels[1].innerHTML).toContain('Month');
      expect(dateLabels[2].innerHTML).toContain('Year');
    });

    it('should display Save and Continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeAll(async () => {
      const response = await request(app).post(CLAIMANT_DOB_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0]
        .getElementsByClassName('govuk-error-summary__title')[0];
      expect(errorSummary.innerHTML).toContain('There was a problem');
    });

    it('should display correct error summary message with correct link', () => {
      const errorSummaryMessages = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
        .getElementsByTagName('li');
      expect(errorSummaryMessages[0].innerHTML).toContain(TestMessages.VALID_YEAR);
      expect(errorSummaryMessages[0].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#year');
      expect(errorSummaryMessages[1].innerHTML).toContain(TestMessages.VALID_MONTH);
      expect(errorSummaryMessages[1].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#month');
      expect(errorSummaryMessages[2].innerHTML).toContain(TestMessages.VALID_DAY);
      expect(errorSummaryMessages[2].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#day');
    });

    it('should display correct error message for date inputs', () => {
      const errorMessages = htmlDocument.getElementsByClassName('govuk-error-message');
      expect(errorMessages[0].innerHTML).toContain(TestMessages.VALID_YEAR);
      expect(errorMessages[1].innerHTML).toContain(TestMessages.VALID_MONTH);
      expect(errorMessages[2].innerHTML).toContain(TestMessages.VALID_DAY);
    });
  });
});
