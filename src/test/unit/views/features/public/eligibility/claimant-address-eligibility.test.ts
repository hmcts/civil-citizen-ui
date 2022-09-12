import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {ELIGIBILITY_CLAIMANT_ADDRESS_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.PAGE_TITLE';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Eligibility Claimant Addresss View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.TITLE'));
    });

    it('should display include help text', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(subHeader[0].innerHTML).toContain(t('PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.UK_MADE_UP'));
    });

    it('should display 2 radio buttons with yes and no options', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
      expect(radios.length).toEqual(2);
    });

    it('should display Save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
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
      const response = await request(app).post(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
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
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_YES_NO_OPTION);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#option');
    });

    it('should display correct error message for radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain(TestMessages.VALID_YES_NO_OPTION);
    });
  });
});
