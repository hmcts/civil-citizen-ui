import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaimApplicantCompanyType} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'Send your response by email';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Send your response by email View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const feesUrl: string = config.get('feesUrl');
  const data = require('../../../../../utils/mocks/feeRangesMock.json');
  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      nock(feesUrl).get('/ranges/').reply(200, data);
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
      expect(header[0].innerHTML).toContain('Reject all of the claim and counterclaim');
    });

    it('should display two h2 headers', () => {
      const headers = htmlDocument.querySelectorAll('h2.govuk-heading-m');
      expect(headers.length).toEqual(2);
      expect(headers[0].innerHTML).toContain('How to counterclaim');
      expect(headers[1].innerHTML).toContain('Help and support');
    });

    it('should display automatically registered paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain('You have chosen to counterclaim. This means your defence cannot continue online. Follow these steps to download, complete and return form N9B. You must pay a court fee. Do not create a new claim.');
      expect(paragraphs[1].innerHTML).toContain('We must receive your completed form before <span class="govuk-body govuk-!-font-weight-bold">4pm on </span>. The claim against you will continue if we do not receive this.');
      expect(paragraphs[9].innerHTML).toContain('Email completed form N9B to:');
      expect(paragraphs[10].innerHTML).toContain('Or, you can send the form by post to:');
      expect(paragraphs[15].innerHTML).toContain('You`ll need to pay a court fee to make a counterclaim. The court will contact you to take payment.');
      expect(paragraphs[16].innerHTML).toContain(TestMessages.FEES_BASED_ON_AMOUNT);
      expect(paragraphs[17].innerHTML).toContain(TestMessages.DO_NOT_CREATE_CLAIM_IF_COUNTERCLAIM);
    });

    it('should display View claim fees details component', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('View claim fees');
    });
  });
});
