import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {NOT_ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../../../../main/routes/urls';
import * as externalURLs from '../../../../../utils/externalURLs';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe("You can't use this servicve View", () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      await request(app).get(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - You can’t use this service');
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-xl');
      expect(header[0].innerHTML).toContain('You can’t use this service');
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    describe('Reason is claim value over 25000', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_OVER_25000)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('This service is for claims of £25,000 or less.');
        expect(paragraphs[1].innerHTML).toContain('For claims between £25,001 and £100,000 you might be able to');
        expect(paragraphs[2].innerHTML).toContain('You can also claim by paper.');
        expect(paragraphs[2].innerHTML).toContain('complete it and return it to make your claim.');
      });

      it('should display address title and address', () => {
        const addressTitle = htmlDocument.getElementsByClassName('govuk-heading-m');
        const address = htmlDocument.getElementsByClassName('govuk-summary-list');
        expect(addressTitle[0].innerHTML).toContain('Where to send paper forms');
        expect(address[0].innerHTML).toContain('County Court Money Claims Centre');
        expect(address[0].innerHTML).toContain('PO Box 527');
        expect(address[0].innerHTML).toContain('Salford');
        expect(address[0].innerHTML).toContain('M5 0BY');
      });

      it('should have external links', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const legacyServiceLink = links[3] as HTMLAnchorElement;
        const n1FormLink = links[4] as HTMLAnchorElement;
        expect(legacyServiceLink.innerHTML).toContain('use Money Claim Online (MCOL)');
        expect(legacyServiceLink.href).toEqual(externalURLs.legacyServiceUrl);
        expect(n1FormLink.innerHTML).toContain('Download a paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is claim value not known', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_NOT_KNOWN)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You need to know the claim amount to use this service.');
        expect(paragraphs[1].innerHTML).toContain('If you can’t calculate the claim amount, for example because you’re claiming for an injury or accident, use the');
      });

      it('should display address title and address', () => {
        const addressTitle = htmlDocument.getElementsByClassName('govuk-heading-m');
        const address = htmlDocument.getElementsByClassName('govuk-summary-list');
        expect(addressTitle[0].innerHTML).toContain('Where to send paper forms');
        expect(address[0].innerHTML).toContain('County Court Money Claims Centre');
        expect(address[0].innerHTML).toContain('PO Box 527');
        expect(address[0].innerHTML).toContain('Salford');
        expect(address[0].innerHTML).toContain('M5 0BY');
      });

      it('should have external links', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const n1FormLink = links[3] as HTMLAnchorElement;
        expect(n1FormLink.innerHTML).toContain('N1 paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });
  });

});
