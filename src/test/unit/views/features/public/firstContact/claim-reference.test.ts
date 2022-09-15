import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  FIRST_CONTACT_CLAIM_REFERENCE_URL,
} from '../../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.FIRST_CONTACT_CLAIM_REFERENCE.PAGE_TITLE';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Respond to Claim - Reference Number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      const res = await request(app).get(FIRST_CONTACT_CLAIM_REFERENCE_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.TITLE'));
    });

    it('should display include help text', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(subHeader[0].innerHTML).toContain(t('PAGES.FIRST_CONTACT_CLAIM_REFERENCE.ENTER_CLAIM'));
    });

    it('should display input element for "Claim number"', async () => {
      const input = htmlDocument.getElementById('claimReferenceValue');
      expect(input).toBeDefined();
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button');
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
    const validClaimNumber = '123MC123';
    const invalidClaimNumber = '1111';

    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      const res = await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link', async () => {
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL)
        .send({claimReferenceValue: invalidClaimNumber})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_CLAIM_REFERENCE_NUMBER'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#claimReferenceValue');
    });

    it('should display correct error summary message with correct link (empty claim reference)', async () => {
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL)
        .send({claimReferenceValue: ''})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.CLAIM_NUMBER_REQUIRED'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#claimReferenceValue');
    });

    it('should display no error summary message when both contact name and number is provided as valid', async () => {
      await request(app).post(FIRST_CONTACT_CLAIM_REFERENCE_URL)
        .send({claimReferenceValue: validClaimNumber})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      expect(htmlDocument).not.toContain('There was a problem');
    });
  });
});
