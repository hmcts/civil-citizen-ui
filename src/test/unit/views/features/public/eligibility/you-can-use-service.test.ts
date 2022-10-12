import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'PAGES.YOU_CAN_USE_SERVICE.PAGE_TITLE';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('You can use this service View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(ELIGIBLE_FOR_THIS_SERVICE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display header', () => {
      const header = mainWrapper.getElementsByClassName('govuk-heading-xl');
      expect(header[0].innerHTML).toContain(t('PAGES.YOU_CAN_USE_SERVICE.TITLE'));
    });

    it('should display paragraph', () => {
      expect(mainWrapper.getElementsByClassName('govuk-body')[0].innerHTML).toContain(t('PAGES.YOU_CAN_USE_SERVICE.BASED_ON_ANSWERS'));
    });

    it('should display Continue button', () => {
      expect(mainWrapper.getElementsByClassName('govuk-button')[0].innerHTML).toContain(t('COMMON.BUTTONS.CONTINUE'));
    });

    it('should display contact us forHelp', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });
});
