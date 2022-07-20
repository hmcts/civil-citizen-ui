import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  DEFENDANT_SUMMARY_URL,
  CLAIM_TASK_LIST_URL,
  CLAIM_DETAILS_URL,
} from '../../../../../../main/routes/urls';
import CivilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';

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

  const mockId = '5129';

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {

    beforeEach(async () => {
      nock('http://localhost:4000')
        .get(`/cases/${mockId}`)
        .reply(200, CivilClaimResponseMock);
      const response = await request(app).get(DEFENDANT_SUMMARY_URL.replace(':id', mockId));
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);

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
        .toContain(CLAIM_DETAILS_URL.replace(':id', mockId));
    });

    it('should have a title', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    describe('Latest Update tab', () => {
      describe('Response to claim section', () => {
        it('should have a title', () => {
          const titles = htmlDocument.getElementsByClassName('govuk-heading-m');
          expect(titles[1].innerHTML).toContain("You haven't responded to this claim");
        });
      });

      it('should have section content paragraph for past the deadline', () => {
        const paragraphs = htmlDocument.getElementsByClassName('govuk-body');
        expect(paragraphs[0].innerHTML).toContain("You haven't responded to the claim. Mr. Jan Clark can now ask for a County Court Judgement against you.");
        expect(paragraphs[1].innerHTML).toContain('A County Court Judgment can mean you find it difficult to get credit, like a mortgage or mobile phone contract. Bailiffs could also be sent to your home.');
        expect(paragraphs[2].innerHTML).toContain('You can still respond to the claim before they ask for a judgment.');
      });

      it('should have a link to respond to claim', () => {
        const links = htmlDocument.getElementsByClassName('govuk-link');
        const sectionLink = links[3] as HTMLAnchorElement;
        expect(sectionLink.innerHTML).toContain('Respond to claim');
        expect(sectionLink.href).toEqual(CLAIM_TASK_LIST_URL.replace(':id', mockId));
      });
    });
  });
});

