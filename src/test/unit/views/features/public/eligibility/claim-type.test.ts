import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {ELIGIBILITY_CLAIM_TYPE_URL} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claim Type View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(ELIGIBILITY_CLAIM_TYPE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Who are you making the claim for?');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Who are you making the claim for?');
    });

    it('should display radio buttons, with correct labels', () => {
      const radioButtons = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radioButtons.length).toBe(3);
      expect(radioButtons[0].innerHTML).toContain('Just my self or my organisation');
      expect(radioButtons[1].innerHTML).toContain('More than one person or organisation');
      expect(radioButtons[2].innerHTML).toContain("A client - I'm their solicitor");
    });

    it('should display save and continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).post(ELIGIBILITY_CLAIM_TYPE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0].getElementsByTagName('a')[0];
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessage.innerHTML).toContain('Select an option');
      expect(errorSummaryMessage.getAttribute('href')).toBe('#option');
    });

    it('should display error message', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Select an option');
    });
  });
});
