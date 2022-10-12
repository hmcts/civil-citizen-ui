import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');

describe('First Contact Access Denied View', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;

    beforeAll(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(FIRST_CONTACT_ACCESS_DENIED_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - You are not authorised to view the claim!');
    });

    it('should have correct page title', () => {
      const hyperlink = htmlDocument.getElementById('claimReferenceUrl');
      expect(hyperlink?.getAttribute('href')).toContain('/first-contact/claim-reference');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('You are not authorised to view the claim!');
    });

    it('should display texts', () => {
      const body = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(body[0].innerHTML).toContain('There was an error during your last operation. Please try again later.');
      expect(body[1].innerHTML).toContain('Click here to try again');
    });

    it('should contain Contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
