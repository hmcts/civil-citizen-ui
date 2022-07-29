import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockRedisWithPaymentAmount, mockCivilClaim} from '../../../../../utils/mockDraftStore';
import civilClaimResponseWithAdmittedPaymentAmountMock from '../../../../../utils/mocks/civilClaimResponseWithAdmittedPaymentAmountMock.json';
import {CITIZEN_PAYMENT_OPTION_URL, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL} from '../../../../../../main/routes/urls';
import PaymentOptionType from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Payment Option View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(CITIZEN_PAYMENT_OPTION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Payment option');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain('When do you want to pay?');
    });

    it('should display 3 radio buttons with payment options', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios.length).toEqual(3);
      expect(radios[0].innerHTML).toContain(PaymentOptionType.IMMEDIATELY);
      expect(radios[1].innerHTML).toContain(PaymentOptionType.BY_SET_DATE);
      expect(radios[2].innerHTML).toContain(PaymentOptionType.INSTALMENTS);
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Save and continue');
    });

    it('should contain contact us detail component', () => {
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
      app.locals.draftStoreClient = mockRedisWithPaymentAmount;
      const response = await request(app).post(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
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
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_PAYMENT_OPTION);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#paymentType');
    });

    it('should display correct error message for radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain(TestMessages.VALID_PAYMENT_OPTION);
    });
  });
});

describe('Part Admit - Payment Option View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockRedisWithPaymentAmount;
      const response = await request(app).get(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set for part admit', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Part Admit - Payment option');
    });

    it('should display header for part admit', () => {
      const paymentAmount = civilClaimResponseWithAdmittedPaymentAmountMock.case_data.partialAdmission.howMuchDoYouOwe.amount;
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain(`When do you want to pay the £${paymentAmount}?`);
    });
  });
});
