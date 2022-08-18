import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {ELIGIBILITY_URL} from '../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'PAGES.TRY_NEW_SERVICE.PAGE_TITLE';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Try the new online service View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBILITY_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
    });

    it('should display first paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain(t('PAGES.TRY_NEW_SERVICE.WE_ARE_BUILDING'));
    });

    it('should display second paragraph', () => {
      expect(paragraphs[1].innerHTML).toContain(t('PAGES.TRY_NEW_SERVICE.YOU_WILL_BE_ASKED'));
    });

    it('should display Continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button');
      expect(button[0].innerHTML).toContain(t('COMMON.BUTTONS.CONTINUE'));
    });

    it('should display contact us forHelp', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });
});
