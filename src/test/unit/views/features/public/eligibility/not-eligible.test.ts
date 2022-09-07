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

describe("You can't use this service View", () => {
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
        const legacyServiceLink = links[2] as HTMLAnchorElement;
        const n1FormLink = links[3] as HTMLAnchorElement;
        expect(legacyServiceLink.innerHTML).toContain('use Money Claim Online (MCOL)');
        expect(legacyServiceLink.href).toEqual(externalURLs.legacyServiceUrl);
        expect(n1FormLink.innerHTML).toContain('Download a paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is claim against government', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.GOVERNMENT_DEPARTMENT)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can\'t use this service to claim against');
        expect(paragraphs[1].innerHTML).toContain(', complete it and return it to make your claim');
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
        const governmentDepartmentsLink = links[2] as HTMLAnchorElement;
        const n1FormLink = links[3] as HTMLAnchorElement;
        expect(governmentDepartmentsLink.innerHTML).toContain('government departments');
        expect(n1FormLink.innerHTML).toContain('Download a paper form');
        expect(governmentDepartmentsLink.href).toEqual(externalURLs.governmentDepartmentsUrl);
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
        const n1FormLink = links[2] as HTMLAnchorElement;
        expect(n1FormLink.innerHTML).toContain('N1 paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is defendant address', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.DEFENDANT_ADDRESS)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can only use this service to claim against a person or organisation with an address in England or Wales.');
        expect(paragraphs[1].innerHTML).toContain('Depending on where you’ll be sending the claim, you might be able to claim using a paper form.');
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
        const n1FormLink = links[2] as HTMLAnchorElement;
        const n510FormLink = links[3] as HTMLAnchorElement;
        expect(n1FormLink.innerHTML).toContain('Download the paper form N1');
        expect(n510FormLink.innerHTML).toContain('form N510');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
        expect(n510FormLink.href).toEqual(externalURLs.n510Url);
      });
    });

    describe('Reason is more than one person or organisation ', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.MULTIPLE_DEFENDANTS)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can’t use this service if this claim is against more than one person or organisation.');
        expect(paragraphs[1].innerHTML).toContain('Use ');
        expect(paragraphs[1].innerHTML).toContain('for claims against 2 people or organisations.');
        expect(paragraphs[2].innerHTML).toContain('for claims against 3 or more people or organisations. Complete and return the form to make your claim.');
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
        const legacyServiceLink = links[2] as HTMLAnchorElement;
        const n1FormLink = links[3] as HTMLAnchorElement;
        expect(legacyServiceLink.innerHTML).toContain('Money Claim Online (MCOL)');
        expect(legacyServiceLink.href).toEqual(externalURLs.legacyServiceUrl);
        expect(n1FormLink.innerHTML).toContain('Download a paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is claim on behalf', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_ON_BEHALF)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('This service is currently for claimants representing themselves.');
        expect(paragraphs[1].innerHTML).toContain('If you’re a legal representative');
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
        const legacyServiceLink = links[2] as HTMLAnchorElement;
        const n1FormLink = links[3] as HTMLAnchorElement;
        expect(legacyServiceLink.innerHTML).toContain('use the Money Claim Online (MCOL) service');
        expect(n1FormLink.innerHTML).toContain('download a paper form');
        expect(legacyServiceLink.href).toEqual(externalURLs.legacyServiceUrl);
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is claimant under 18', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_CLAIMANT)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You need to be 18 or over to use this service.');
        expect(paragraphs[1].innerHTML).toContain('You might be able to get advice from organisations like');
        expect(paragraphs[1].innerHTML).toContain('Citizens Advice');
        expect(paragraphs[1].innerHTML).toContain('about making a claim.');
      });

      it('should have external links', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const n1FormLink = links[2] as HTMLAnchorElement;
        expect(n1FormLink.innerHTML).toContain('Citizens Advice');
        expect(n1FormLink.href).toEqual(externalURLs.citizensAdviceUrl);
      });
    });

    describe('Reason multiple claimants', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.MULTIPLE_CLAIMANTS)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can’t use this service if more than one person or organisation is making the claim.');
        expect(paragraphs[1].innerHTML).toContain('Download a paper form');
        expect(paragraphs[1].innerHTML).toContain('complete it and return it to make your claim.');
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
        const n1FormLink = links[2] as HTMLAnchorElement;
        expect(n1FormLink.innerHTML).toContain('Download a paper form');
        expect(n1FormLink.href).toEqual(externalURLs.n1FormUrl);
      });
    });

    describe('Reason is claim for tenancy deposit', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can’t make a claim for a tenancy deposit using this service.');
        expect(paragraphs[1].innerHTML).toContain('Get');
        expect(paragraphs[1].innerHTML).toContain('with a landlord or tenant.');
      });

      it('should have external links', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const tenancyServiceUrl = links[2] as HTMLAnchorElement;
        expect(tenancyServiceUrl.innerHTML).toContain('help to resolve your dispute');
        expect(tenancyServiceUrl.href).toEqual(externalURLs.tenancyServiceUrl);
      });
    });

    describe('Reason is no UK address', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIMANT_ADDRESS)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You need to have an address in the UK to make a money claim.');
      });
    });

    describe('Reason defendant under 18', () => {
      beforeEach(async () => {
        await request(app).get(constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_DEFENDANT)).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('You can only use this service to claim against a defendant who’s 18 or over.');
        expect(paragraphs[1].innerHTML).toContain('You might be able to get advice from organisations like ');
        expect(paragraphs[1].innerHTML).toContain('about making a claim.');
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
        const citizenAdvicesContactUsLink = links[2] as HTMLAnchorElement;
        expect(citizenAdvicesContactUsLink.innerHTML).toContain('Citizens Advice');
        expect(citizenAdvicesContactUsLink.href).toEqual(externalURLs.citizenAdviceContactUsUrl);
      });
    });
  });
});
