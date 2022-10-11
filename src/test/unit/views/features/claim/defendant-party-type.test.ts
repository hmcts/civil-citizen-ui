import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL} from '../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Defendant Party View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      const response = await request(app).get(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Who are you making the claim against?');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Who are you making the claim against?');
    });

    it('should display radio buttons, with correct labels', () => {
      const radioButtons = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].innerHTML).toContain('An individual');
      expect(radioButtons[0].innerHTML).toContain('For example someone you lent money to');
      expect(radioButtons[1].innerHTML).toContain('A sole trader or self-employed person');
      expect(radioButtons[1].innerHTML).toContain('For example a tradesperson who did work for you');
      expect(radioButtons[2].innerHTML).toContain('A limited company');
      expect(radioButtons[2].innerHTML).toContain('For example a company that sold you goods or services');
      expect(radioButtons[3].innerHTML).toContain('Another type of organisation');
      expect(radioButtons[3].innerHTML).toContain('For example a partnership, trust, charity, club or association');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    it('should display save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).post(CLAIM_DEFENDANT_PARTY_TYPE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0].getElementsByTagName('a')[0];
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessage.innerHTML).toContain('Choose your response');
      expect(errorSummaryMessage.getAttribute('href')).toBe('#option');
    });

    it('should display error message', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Choose your response');
    });
  });
});
