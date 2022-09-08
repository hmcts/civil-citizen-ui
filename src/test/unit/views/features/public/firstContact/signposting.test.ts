import config from 'config';
import { t } from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_SIGNPOSTING_URL,
} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');

describe('Signposting View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      const response = await request(app).get(FIRST_CONTACT_SIGNPOSTING_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.FIRST_CONTACT_SIGNPOSTING.PAGE_TITLE')}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PAGE_TITLE'));
    });

    it('should display paragraphs', () => {
      const body = htmlDocument.getElementsByClassName('govuk-body');
      expect(body[0].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_1'));
      expect(body[1].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_2'));
      expect(body[2].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_3'));
      expect(body[3].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_4_PART_1'));
      expect(body[3].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_4_PART_2'));
      expect(body[4].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_5'));
      expect(body[5].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.PARAGRAPH_6'));
    });

    it('should display url list in support section', () => {
      const body = htmlDocument.getElementsByClassName('govuk-body-s');
      expect(body[0].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.SUPPORT_CLAIM_FEES_URL'));
      expect(body[1].innerHTML).toContain(t('PAGES.FIRST_CONTACT_SIGNPOSTING.SUPPORT_CONTACT_US_URL'));
    });

    it('should have correct link to claim reference page', () => {
      const hyperlink = htmlDocument.getElementsByClassName('govuk-button govuk-button--start');
      expect(hyperlink[0]?.getAttribute('href')).toContain('/first-contact/claim-reference');
    });
  });
});
