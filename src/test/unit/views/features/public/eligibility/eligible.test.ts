import config from 'config';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  ELIGIBILITY_HWF_ELIGIBLE,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import * as externalURLs from '../../../../../utils/externalURLs';
import nock from 'nock';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('You can use this service View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      await request(app).get(ELIGIBLE_FOR_THIS_SERVICE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    describe('HWF Eligible', () => {
      beforeEach(async () => {
        await request(app).get(ELIGIBILITY_HWF_ELIGIBLE).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });
      it('should have title set', () => {
        expect(htmlDocument.title).toContain('Your money claims account - You can use this service');
      });

      it('should display header', async () => {
        const header = htmlDocument.getElementsByClassName('govuk-heading-xl');
        expect(header[0].innerHTML).toContain('You can use this service');
      });

      it('should contain contact us detail component', () => {
        const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
        expect(contactUs[0].innerHTML).toContain('Contact us for help');
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('Based on your answers you can make a money claim using this service.');
        expect(paragraphs[1].innerHTML).toContain('You will have to pay court fees unless you are eligible for Help with Fees.');
      });

      it('should have external links', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const helpWithFeesLink = links[2] as HTMLAnchorElement;
        expect(helpWithFeesLink.innerHTML).toContain('Find out more about Help with Fees (opens in a new window)');
        expect(helpWithFeesLink.href).toEqual(externalURLs.feesHelpUri);
      });

    });

    describe('HWF Eligible Reference', () => {
      beforeEach(async () => {
        await request(app).get(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });
      it('should have title set', () => {
        expect(htmlDocument.title).toContain('Your money claims account - You can use this service');
      });

      it('should display header', async () => {
        const header = htmlDocument.getElementsByClassName('govuk-heading-xl');
        expect(header[0].innerHTML).toContain('You can use this service');
      });

      it('should contain contact us detail component', () => {
        const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
        expect(contactUs[0].innerHTML).toContain('Contact us for help');
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('Based on your answers you can make a money claim using this service.');
        expect(paragraphs[1].innerHTML).toContain('Remember that you will not know about the fee until we have processed your Help with Fees application. Your claim will only be issued after Help with Fees is confirmed, or the fee is paid.');
      });

    });

    describe('Eligible for this Service', () => {
      beforeEach(async () => {
        await request(app).get(ELIGIBLE_FOR_THIS_SERVICE_URL).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });
      it('should have title set', () => {
        expect(htmlDocument.title).toContain('Your money claims account - You can use this service');
      });

      it('should display header', async () => {
        const header = htmlDocument.getElementsByClassName('govuk-heading-xl');
        expect(header[0].innerHTML).toContain('You can use this service');
      });

      it('should contain contact us detail component', () => {
        const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
        expect(contactUs[0].innerHTML).toContain('Contact us for help');
      });

      it('should display paragraphs', async () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain('Based on your answers you can make a money claim using this service.');
      });

    });

  });
});
