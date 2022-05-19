import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../../main/app';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS} from '../../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const pageTitle = 'You\'ve Paid Less';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('You Have Paid Less View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('You\'ve paid less than the total claim amount');
    });

    it('should display continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Continue');
    });

    it('should display explanation paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('You need to explain why you believe you don\'t owe the remaining amount.');
    });

    it('should display rejection paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[1];
      expect(paragraph.innerHTML).toContain('If Mr. Jan Clark rejects your explanation you might have to go to a hearing.');
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });
});
