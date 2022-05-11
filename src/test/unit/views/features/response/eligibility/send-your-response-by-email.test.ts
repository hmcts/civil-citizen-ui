import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaimApplicantCompanyType} from '../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'Money Claims';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Send your response by email View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;
      const response = await request(app).get(SEND_RESPONSE_BY_EMAIL_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Post your response');
    });

    it('should display two h2 headers', () => {
      const headers = htmlDocument.querySelectorAll('h2.govuk-heading-m');
      expect(headers.length).toEqual(3);
      expect(headers[0].innerHTML).toContain('Follow these steps');
      expect(headers[1].innerHTML).toContain('Download and complete the form');
      expect(headers[2].innerHTML).toContain('Counterclaim fee');
    });

    it('should display automatically registered paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain('We need to receive your response before <span class="govuk-body govuk-!-font-weight-bold">4pm on </span>. You could get a County Court Judgment against you if you miss the deadline.');
      expect(paragraphs[6].innerHTML).toContain('You can also email completed forms to civilmoneyclaimsaat@gmail.com');
      expect(paragraphs[7].innerHTML).toContain('Use these details when completing the form');
      expect(paragraphs[11].innerHTML).toContain('You`ll need to pay a court fee if you make a counterclaim.');
    });
    
    it('should display View claim fees details component', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('View claim fees');
    });
  });
});
