import config from 'config';
import nock from 'nock';
import {app} from '../../../../main/app';
import request from 'supertest';
import {t} from 'i18next';
import {DQ_EXPERT_REPORT_DETAILS_URL, DQ_EXPERT_SMALL_CLAIMS_URL} from '../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'PAGES.EXPERT_SMALL_CLAIMS.PAGE_TITLE';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Using an expert View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(DQ_EXPERT_SMALL_CLAIMS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
      paragraphs = mainWrapper.getElementsByClassName(govukBodyClass);
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t(pageTitle)}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.TITLE'));
    });

    it('should display first paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.RARE_FOR_A_JUDGE'));
    });

    it('should display second paragraph', () => {
      expect(paragraphs[1].innerHTML).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.EXPERT_NOT_REPRESENTATIVE'));
    });

    it('should display Continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button');
      expect(button[0].innerHTML).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.CONTINUE'));
    });

    it('should have links', () => {
      const links = paragraphs[2].querySelectorAll('a');
      const dqExpertReportsLink = links[0] as HTMLAnchorElement;
      expect(dqExpertReportsLink.innerHTML).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.NEEDS_AN_EXPERT'));
      expect(dqExpertReportsLink.href).toEqual(DQ_EXPERT_REPORT_DETAILS_URL);
    });

    it('should display contact us for Help', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });
});
