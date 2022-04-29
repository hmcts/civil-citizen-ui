import config from 'config';
import nock from 'nock';
import { app } from '../../../../../../../main/app';
import request from 'supertest';
import { COMPANY_TELEPHONE_NUMBER_URL } from '../../../../../../../main/routes/urls';
import { mockCivilClaim } from '../../../../../../utils/mockDraftStore';
import civilClaimResponseMock from '../../../../../../utils/mocks/civilClaimResponseMock.json'
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import {
 
  AMOUNT_REQUIRED,
  
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { DateFormatter } from '../../../../../../../main/common/utils/dateFormatter';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
console.log(TestMessages.AMOUNT_LESS_THEN_CLAIMED, AMOUNT_REQUIRED, DateFormatter)

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

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
      expect(header[0].innerHTML).toContain('Is '+ civilClaimResponseMock.case_data.respondent1.organisationName +' the right person for the mediation service to call?');
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

    it('should display correct error summary message with correct link for Payment Amount', () => {
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_YES_NO_SELECTION);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#option');
    });
  });

});
