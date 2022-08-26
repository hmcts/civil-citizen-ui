import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {ELIGIBILITY_DEFENDANT_AGE_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Defendant Age Eligibility View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBILITY_DEFENDANT_AGE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Defendant Age Eligibility');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain('Do you believe the person you’re claiming against is 18 or over?');
    });

    it('should display 3 radio buttons ', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
      expect(radios[2].innerHTML).toContain('I\'m claiming against a company or organisation');
      expect(radios.length).toEqual(3);
    });

    it('should display Save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Save and continue');
    });

    it('should contain Contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).post(ELIGIBILITY_DEFENDANT_AGE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link', () => {
      const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0];
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_DEFENDENT_AGE_ELIGIBILITY);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#option');
    });

    it('should display correct error message for radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain(TestMessages.VALID_DEFENDENT_AGE_ELIGIBILITY);
    });
  });
});
