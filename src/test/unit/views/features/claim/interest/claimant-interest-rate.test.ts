import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CLAIMANT_INTEREST_RATE_URL,
} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');

describe('Claimant Phone View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;
    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      const response = await request(app).get(CLAIMANT_INTEREST_RATE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.CLAIMANT_INTEREST_RATE.PAGE_TITLE')}`);
    });

    it('should display heading', () => {
      const body = mainWrapper.getElementsByClassName('govuk-heading-l');
      expect(body[0].innerHTML).toContain(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE'));
    });

    it('should display paragraphs', () => {
      const body = mainWrapper.getElementsByClassName('govuk-body');
      expect(body[0].innerHTML).toContain(t('PAGES.CLAIMANT_INTEREST_RATE.RATE_INFORMATION'));
    });

    it('should display form elements', () => {
      const formElm = mainWrapper.getElementsByClassName('govuk-form-group');
      expect(formElm.length).toBe(4);
    });

    it('should display save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
