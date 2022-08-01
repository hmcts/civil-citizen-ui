import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_CARER_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
describe('Carer View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_CARER_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display title', async () => {
      expect(htmlDocument.title).toContain(t('PAGES.CARER.PAGE_TITLE'));
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain('Do you claim Carer’s Allowance or Carer’s Credit?');
    });

    it('should display yes/no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
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

  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).post(CITIZEN_CARER_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary if no radio selection carer', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].innerHTML)
        .toContain('Choose option: Yes or No');
    });

    it('should display error message for radios carer', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Choose option: Yes or No');
    });
  });

});
