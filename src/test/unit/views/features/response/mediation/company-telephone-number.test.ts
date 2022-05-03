import config from 'config';
import nock from 'nock';
import { app } from '../../../../../../main/app';
import request from 'supertest';
import { COMPANY_TELEPHONE_NUMBER_URL } from '../../../../../../main/routes/urls';
import { mockCivilClaim } from '../../../../../utils/mockDraftStore';
import civilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { YesNo } from '../../../../../../main/common/form/models/yesNo';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Mediation - Company or Organisation - Confirm telephone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(COMPANY_TELEPHONE_NUMBER_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain('Is ' + civilClaimResponseMock.case_data.respondent1.organisationName + ' the right person for the mediation service to call?');
    });

    it('should display 2 radio buttons with yes and no options', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios.length).toEqual(2);
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
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


    describe('Yes Section', () => {
      it('should display "Confirm telephone number" text', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-label');
        expect(paragraph[1].innerHTML).toContain('Confirm telephone number');
      });
      it('should display input element for Confirm telephone number', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-input govuk-!-width-two-thirds');
        expect(paragraph[0].id).toContain('mediationPhoneNumberConfirmation');
      });
    });

    describe('No Section', () => {
      it('should display "Who should the mediation service call?" text', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-label');
        expect(paragraph[3].innerHTML).toContain('Who should the mediation service call?');
      });
      it('should display input element for "Who should the mediation service call?"', async () => {
        const input = htmlDocument.getElementById('ediationContactPerson');
        expect(input).toBeDefined();
      });
      it('should display "Enter this person’s phone number" text', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-label');
        expect(paragraph[4].innerHTML).toContain('Enter this person’s phone number, including extension if required.');
      });
      it('should display input element for "Enter this person’s phone number"', async () => {
        const input = htmlDocument.getElementById('mediationPhoneNumber');
        expect(input).toBeDefined();
      });

      it('should display hint text', async () => {
        const hint = htmlDocument.getElementsByClassName('govuk-hint');
        expect(hint[1].innerHTML).toContain('For example, 02012346788 ext. 153');
      });
    });
  });

  describe('on POST', () => {
    const validPhoneNumber = '012345678901234567890123456789';
    const inValidPhoneNumber = '0123456789012345678901234567890';
    const validName = 'David';
    const inValidName = 'Daviddaviddaviddaviddaviddavido';

    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).post(COMPANY_TELEPHONE_NUMBER_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link for Yes/No selection ', () => {
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_YES_NO_OPTION);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#option');
    });

    it('should display correct error summary message with correct link for confirm telephone number when yes is an option', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.YES })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumberConfirmation');
    });

    it('should display correct error summary message with correct link for long telephone number when yes is an option', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.YES, mediationPhoneNumberConfirmation : inValidPhoneNumber })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.TEXT_TOO_LONG);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumberConfirmation');
    });

    it('should display no errors when yes is an option and confirmation phone number is provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.YES, mediationPhoneNumberConfirmation: validPhoneNumber })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      expect(htmlDocument).not.toContain('There was a problem');
    });

    it('should display correct error summary message with correct link for contact name when no is an option but nothing provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.NAME_REQUIRED);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationContactPerson');
    });

    it('should display correct error summary message with correct link for contact number when no is an option but nothing provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(1);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.PHONE_NUMBER_REQUIRED);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumber');
    });

    it('should display correct error summary message with correct link for contact name when no is an option but too long name is provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationContactPerson: inValidName })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.TEXT_TOO_LONG);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationContactPerson');
    });

    it('should display correct error summary message with correct link for contact number when no is an option but too long phone number is provided', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationPhoneNumber: inValidPhoneNumber })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(1);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.TEXT_TOO_LONG);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#mediationPhoneNumber');
    });

    it('should display no error summary message when both contact name and number is provided as valid', async () => {
      await request(app)
        .post(COMPANY_TELEPHONE_NUMBER_URL)
        .send({ option: YesNo.NO, mediationContactPerson: validName, mediationPhoneNumber : validPhoneNumber })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      expect(htmlDocument).not.toContain('There was a problem');
    });
  });
});
