import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {RESPONSE_DEADLINE_OPTIONS_URL} from '../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Response Deadline Options View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(RESPONSE_DEADLINE_OPTIONS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Response deadline');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('deadline');
    });

    it('should display current response deadline sub header', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-heading-m');
      expect(subHeader[0].innerHTML).toContain('Current response deadline: 4pm on 15 May 2022');
    });

    it('should display request more time sub header', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-fieldset__legend--m');
      expect(subHeader[0].innerHTML).toContain('Do you want to request more time to respond?');
    });

    it('should display 4 radio buttons, with correct labels', () => {
      const radioButtons = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].innerHTML).toContain('Yes, I want to request more time');
      expect(radioButtons[1].innerHTML).toContain('I have already agreed more time with Mr. Jan Clark\'s legal representative');
      expect(radioButtons[2].innerHTML).toContain('My request for more time has been refused');
      expect(radioButtons[3].innerHTML).toContain('No, I do not want to request more time');
    });

    it('should display radio button conditional', () => {
      const conditionalContent = htmlDocument.getElementsByClassName('govuk-radios__conditional')[0]
        .getElementsByClassName('govuk-body');
      const formLink = conditionalContent[0].getElementsByClassName('govuk-link')[0];

      expect(conditionalContent[0].innerHTML).toContain('If your request to Mr. Jan Clark\'s legal representative for more time has been refused');
      expect(conditionalContent[1].innerHTML).toContain('Email the completed form N244 to: contact@justice.govu.uk.');
      expect(conditionalContent[2].innerHTML).toContain('Or, you can post the completed form to:');
      expect(conditionalContent[3].innerHTML).toContain('HMCTS CMC');
      expect(conditionalContent[4].innerHTML).toContain('PO Box 12747');
      expect(conditionalContent[5].innerHTML).toContain('Harlow');
      expect(conditionalContent[6].innerHTML).toContain('CM20 9RA');
      expect(conditionalContent[7].innerHTML).toContain('Tel: 0300 123 7050');
      expect(formLink.innerHTML).toContain('Form N244 (opens in new tab)');
      expect(formLink.getAttribute('href')).toBe('https://www.gov.uk/government/publications/form-n244-application-notice');
    });

    it('should display save and continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).post(RESPONSE_DEADLINE_OPTIONS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0].getElementsByTagName('a')[0];
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessage.innerHTML).toContain('Select if you want to request more time');
      expect(errorSummaryMessage.getAttribute('href')).toBe('#option');
    });

    it('should display error message', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Select if you want to request more time');
    });
  });
});
