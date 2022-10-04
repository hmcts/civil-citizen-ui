import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIM_COMPLETING_CLAIM_URL} from '../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');

describe('Completing Claim View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      const response = await request(app).get(CLAIM_COMPLETING_CLAIM_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Get the details right');
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
      expect(header.innerHTML).toContain('Get the details right');
    });

    it('should display You\'ll have to pay an paragraph', () => {
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('You\'ll have to pay an additional fee if you want you:');
    });

    it('should display bullet list', () => {
      const listItems = htmlDocument.getElementsByClassName('govuk-list--bullet')[0].getElementsByTagName('li');
      expect(listItems.length).toEqual(3);
      expect(listItems[0].innerHTML).toContain('change the name of anyone involved with the claim');
      expect(listItems[1].innerHTML).toContain('change the basis of your claim - for example, saying goods were undelivered instead of faulty');
      expect(listItems[2].innerHTML).toContain('add information that significantly change your claim');
    });

    it('should display I confirm I\'ve read this button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain("I confirm I've read this");
    });

    it('should display contact us for help detail', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });
  });
});
