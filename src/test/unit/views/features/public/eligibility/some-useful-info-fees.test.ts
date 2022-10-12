import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {ELIGIBILITY_INFORMATION_FEES_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');

describe('Some useful information about Help with Fees View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBILITY_INFORMATION_FEES_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Some useful information about Help with Fees');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Some useful information about Help with Fees');
    });

    it('should display texts', () => {
      const body = mainWrapper.getElementsByClassName('govuk-body-m');
      const subtitle = mainWrapper.getElementsByClassName('govuk-heading-m');
      expect(body[0].innerHTML).toContain('Making an application for Help with Fees does not guarantee that you will get your fee covered. You may still have to pay some or all of your court fee to get the claim issued (for the court system to officially start the claim and send details to the other side). When you apply for Help with Fees, you should receive an update from us within 5 working days, giving you the result of your application.');
      expect(body[1].innerHTML).toContain('If you want to apply for Help with Fees, you will complete an online form in a new window. This will give you a reference number. Please note the number and keep it safe, as you will need it later in the claim process. (NB: if you have more than one claim going on, each claim must have a separate Help with Fees application and reference number). You can send in your claim as soon as you have the Help with Fees reference number, but the claim will not be issued until the Help with Fees application has been processed by the court. This is so that you will know what fees are covered and what you still have to pay. If you choose not to pay, the claim will not be issued. The claim will stop here unless you change your mind within 95 days.');
      expect(body[2].innerHTML).toContain('You may be asked by the court to email evidence in support of your application before your claim is issued.');
      expect(subtitle[0].innerHTML).toContain('Do you wish to continue to make a Help with Fees Application?');
    });

    it('should display 2 radio buttons with yes and no options', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
      expect(radios.length).toEqual(2);
    });

    it('should display Save and continue button', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-button');
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
    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).post(ELIGIBILITY_INFORMATION_FEES_URL);
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
