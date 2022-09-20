import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  COOKIES_URL,
} from '../../../../../main/routes/urls';
import * as externalURLs from '../../../../utils/externalURLs';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');

describe('Cookies View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(COOKIES_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.COOKIES.TITLE')}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.COOKIES.TITLE'));
    });

    it('should display explantion paragraphs', () => {
      const paragraphs = mainWrapper.getElementsByClassName('govuk-body');
      expect(paragraphs[0].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION1'));
      expect(paragraphs[1].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION2'));
      expect(paragraphs[2].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION3'));
      expect(paragraphs[3].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION4'));
      expect(paragraphs[4].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION5'));
      expect(paragraphs[5].innerHTML).toContain(t('PAGES.COOKIES.COOKIES_EXPLANATION6'));
    });

    it('should display subheadings', () => {
      const headings = mainWrapper.getElementsByClassName('govuk-heading-m');
      const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s');
      expect(headings[0].innerHTML).toContain(t('PAGES.COOKIES.HEADING'));
      expect(subHeadings[0].innerHTML).toContain(t('PAGES.COOKIES.SUBHEADING1'));
      expect(subHeadings[1].innerHTML).toContain(t('PAGES.COOKIES.SUBHEADING3'));
      expect(subHeadings[2].innerHTML).toContain(t('PAGES.COOKIES.SUBHEADING4'));
    });

    it('should display lists', () => {
      const lists = htmlDocument.getElementsByClassName('govuk-list govuk-list--bullet');
      expect(lists[0].getElementsByTagName('li')[0].innerHTML).toContain(t('PAGES.COOKIES.BULLET_LIST1.FIRST'));
      expect(lists[0].getElementsByTagName('li')[1].innerHTML).toContain(t('PAGES.COOKIES.BULLET_LIST1.SECOND'));
      expect(lists[1].getElementsByTagName('li')[0].innerHTML).toContain(t('PAGES.COOKIES.BULLET_LIST2.FIRST'));
      expect(lists[1].getElementsByTagName('li')[1].innerHTML).toContain(t('PAGES.COOKIES.BULLET_LIST2.SECOND'));
      expect(lists[1].getElementsByTagName('li')[2].innerHTML).toContain(t('PAGES.COOKIES.BULLET_LIST2.THIRD'));
    });

    it('should display analytics cookie details table', () => {
      const tables = htmlDocument.getElementsByClassName('govuk-table');
      const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
      const cells = tables[0].getElementsByClassName('govuk-table__cell');
      expect(tables[0].getElementsByTagName('caption')[0].innerHTML).toContain(t('PAGES.COOKIES.SUBHEADING2'));
      expect(tableHeaders[3].innerHTML).toContain(t('PAGES.COOKIES.NAME'));
      expect(tableHeaders[4].innerHTML).toContain(t('PAGES.COOKIES.PURPOSE'));
      expect(tableHeaders[5].innerHTML).toContain(t('PAGES.COOKIES.EXPIRES'));
      expect(cells[0].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GA.NAME'));
      expect(cells[1].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GA.PURPOSE'));
      expect(cells[2].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GA.EXPIRES'));
      expect(cells[3].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GID.NAME'));
      expect(cells[4].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GID.PURPOSE'));
      expect(cells[5].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GID.EXPIRES'));
      expect(cells[6].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GAT.NAME'));
      expect(cells[7].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GAT.PURPOSE'));
      expect(cells[8].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS1.GAT.EXPIRES'));
    });

    it('should display analytics cookie options', () => {
      const heading = htmlDocument.getElementsByClassName('govuk-fieldset__legend--s');
      const parent = htmlDocument.getElementsByClassName('govuk-radios');
      const radios = parent[0].getElementsByClassName('govuk-radios__label');
      expect(heading[0].innerHTML).toContain(t('PAGES.COOKIES.ANALYTICS_COOKIE_OPTIONS.HEADING'));
      expect(radios[0].innerHTML).toContain(t('PAGES.COOKIES.ANALYTICS_COOKIE_OPTIONS.ON_OPTION'));
      expect(radios[1].innerHTML).toContain(t('PAGES.COOKIES.ANALYTICS_COOKIE_OPTIONS.OFF_OPTION'));
    });

    it('should display app performance cookie details table', () => {
      const tables = htmlDocument.getElementsByClassName('govuk-table');
      const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
      const cells = tables[1].getElementsByClassName('govuk-table__cell');
      expect(tables[0].getElementsByTagName('caption')[0].innerHTML).toContain(t('PAGES.COOKIES.SUBHEADING2'));
      expect(tableHeaders[3].innerHTML).toContain(t('PAGES.COOKIES.NAME'));
      expect(tableHeaders[4].innerHTML).toContain(t('PAGES.COOKIES.PURPOSE'));
      expect(tableHeaders[5].innerHTML).toContain(t('PAGES.COOKIES.EXPIRES'));
      expect(cells[0].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTCOOKIE.NAME'));
      expect(cells[1].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTCOOKIE.PURPOSE'));
      expect(cells[2].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTCOOKIE.EXPIRES'));
      expect(cells[3].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTLATC.NAME'));
      expect(cells[4].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTLATC.PURPOSE'));
      expect(cells[5].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTLATC.EXPIRES'));
      expect(cells[6].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTPC.NAME'));
      expect(cells[7].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTPC.PURPOSE'));
      expect(cells[8].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTPC.EXPIRES'));
      expect(cells[9].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTSA.NAME'));
      expect(cells[10].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTSA.PURPOSE'));
      expect(cells[11].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.DTSA.EXPIRES'));
      expect(cells[12].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVISITOR.NAME'));
      expect(cells[13].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVISITOR.PURPOSE'));
      expect(cells[14].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVISITOR.EXPIRES'));
      expect(cells[15].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVT.NAME'));
      expect(cells[16].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVT.PURPOSE'));
      expect(cells[17].innerHTML).toContain(t('PAGES.COOKIES.COOKIE_DETAILS2.RXVT.EXPIRES'));
    });

    it('should display app performance cookie options', () => {
      const heading = htmlDocument.getElementsByClassName('govuk-fieldset__legend--s');
      const parent = htmlDocument.getElementsByClassName('govuk-radios');
      const radios = parent[1].getElementsByClassName('govuk-radios__label');
      expect(heading[1].innerHTML).toContain(t('PAGES.COOKIES.PERFORMANCE_COOKIE_OPTIONS.HEADING'));
      expect(radios[0].innerHTML).toContain(t('PAGES.COOKIES.PERFORMANCE_COOKIE_OPTIONS.ON_OPTION'));
      expect(radios[1].innerHTML).toContain(t('PAGES.COOKIES.PERFORMANCE_COOKIE_OPTIONS.OFF_OPTION'));
    });

    it('should have hyper link for find out more about essential cookies', () => {
      const links = mainWrapper.getElementsByClassName('govuk-link');
      const essentialCookiesLink = links[0] as HTMLAnchorElement;
      expect(essentialCookiesLink.innerHTML).toContain(t('PAGES.COOKIES.FIND_MORE_ABOUT_COOKIES'));
      expect(essentialCookiesLink.href).toEqual(externalURLs.essentialCookiesUrl);
    });

    it('should have save button', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain(t('COMMON.BUTTONS.SAVE'));
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
