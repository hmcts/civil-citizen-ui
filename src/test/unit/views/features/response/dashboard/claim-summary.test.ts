import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CLAIMANT_SUMMARY_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body-s';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Send your response by email View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;
  let paragraphs: HTMLCollection;

  describe('on GET', () => {

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIMANT_SUMMARY_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
        paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);

      });
    });

    it('should display title and description', () => {
      const headers = htmlDocument.getElementsByClassName('govuk-heading-m');
      expect(headers[0].innerHTML).toContain('Mr. Jan Clark v Version 1');
      expect(paragraphs[0].innerHTML).toContain('Claim number:');
      expect(paragraphs[0].innerHTML).toContain('000MC009');
    });

    it('should display tabs', () => {
      const tabs = htmlDocument.getElementsByClassName('govuk-tabs');
      expect(tabs[0].innerHTML).toContain('Latest update');
      expect(tabs[0].innerHTML).toContain('Documents');
    });

    it('should display aboutClaimWidget', () => {
      const aboutClaimWidget = htmlDocument.getElementsByClassName('govuk-grid-column-one-third');
      expect(aboutClaimWidget[0].querySelectorAll('h3')[0].innerHTML).toContain('About claim');
      expect(aboutClaimWidget[0].querySelectorAll('p')[0].innerHTML).toContain('Claimant name:');
      expect(aboutClaimWidget[0].querySelectorAll('p')[1].innerHTML).toContain('Mr. Jan Clark');
      expect(aboutClaimWidget[0].querySelectorAll('p')[1]
        .querySelectorAll('a')[0]
        .getAttribute('href'))
        .toContain('contact-them');
      expect(aboutClaimWidget[0].querySelectorAll('p')[2].innerHTML).toContain('Claim amount:');
      expect(aboutClaimWidget[0].querySelectorAll('p')[3].innerHTML).toContain('£110');
      expect(aboutClaimWidget[0].querySelectorAll('p')[4].innerHTML).toContain('Claim details:');
      expect(aboutClaimWidget[0].querySelectorAll('p')[5].innerHTML).toContain('View claim');
      expect(aboutClaimWidget[0].querySelectorAll('p')[5]
        .querySelectorAll('a')[0]
        .getAttribute('href'))
        .toContain('/case/:id/response/claim-details');
    });

  });
});
