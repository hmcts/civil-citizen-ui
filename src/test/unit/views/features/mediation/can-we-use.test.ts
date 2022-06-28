import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {
  CAN_WE_USE_URL,
} from '../../../../../main/routes/urls';
import { mockCivilClaim } from '../../../../utils/mockDraftStore';
import {
  PHONE_NUMBER_REQUIRED,
  VALID_YES_NO_OPTION,
  VALID_TEXT_LENGTH,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const civilClaimResponseMock = require('./noRespondentTelephoneMock.json');
civilClaimResponseMock.case_data.respondent1.telephoneNumber = '';
const civilClaimResponseMockWithoutRespondentPhone: string = JSON.stringify(civilClaimResponseMock);
const mockWithoutRespondentPhone = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponseMockWithoutRespondentPhone)),
};

describe('Confirm Mediation Individual Telephone Number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('Repayment Plan View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CAN_WE_USE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Mediation - Provide a phone number');
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Confirm your telephone number');
    });

    it('should display respondent telephone number and text', async () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(paragraph[0].innerHTML).toContain('Can the mediation service use 111 to call you?');
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

    describe('YesNoForm Component', () => {
      it('should display yes and no radio button', async () => {
        const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
        const labels = htmlDocument.getElementsByClassName('govuk-radios__label');
        expect(radios.length).toEqual(2);
        expect(labels.length).toEqual(2);
        expect(labels[0].innerHTML).toContain('Yes');
        expect(labels[1].innerHTML).toContain('No');
      });
    });

    describe('Input field control', () => {
      it('should display phone number input text', async () => {
        const input = htmlDocument.getElementsByClassName('govuk-input');
        const labels = htmlDocument.getElementsByClassName('govuk-label');
        expect(input).toBeDefined();
        expect(labels).toBeDefined();
        expect(labels[2].innerHTML).toContain('Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.');
      });
    });

    describe('Enter a phone number screen', () => {
      it('should display header and text note when phone number is not provided', async () => {
        app.locals.draftStoreClient = mockWithoutRespondentPhone;
        await request(app).get(CAN_WE_USE_URL).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
          const header = htmlDocument.getElementsByClassName('govuk-heading-l');
          const paragraph = htmlDocument.getElementsByClassName('govuk-body-m');
          const input = htmlDocument.getElementsByClassName('govuk-input');
          const labels = htmlDocument.getElementsByClassName('govuk-label');
          const buttons = htmlDocument.getElementsByClassName('govuk-button');
          expect(header[0].innerHTML).toContain('Enter a phone number');
          expect(paragraph[0].innerHTML).toContain('Enter the number for a direct line the mediation service can use. We won\'t give the number to anyone else.');
          expect(input).toBeDefined();
          expect(labels).toBeDefined();
          expect(buttons[0].innerHTML).toContain('Save and continue');
        });
      });
    });
  });

  describe('on POST', () => {
    const getErrorSummaryListElement = (index:number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CAN_WE_USE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link for yes and no option', () => {
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(VALID_YES_NO_OPTION);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#option');
    });

    it('should display correct error summary message with correct link for telephone number is undefined', async () => {
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({ option: 'no', telephoneNumber: ''})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(PHONE_NUMBER_REQUIRED);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumber');
    });

    it('should display correct error summary message with correct link for telephone number greater than 30 characters', async () => {
      await request(app)
        .post(CAN_WE_USE_URL)
        .send({ option: 'no', telephoneNumber: '1234567890123456789012345678900'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(VALID_TEXT_LENGTH);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumber');
    });

  });
});
