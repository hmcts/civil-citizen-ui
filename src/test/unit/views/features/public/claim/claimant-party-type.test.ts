import config from 'config';
import { t } from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {
  CLAIMANT_PARTY_TYPE_SELECTION_URL,
} from '../../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Signposting View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: any;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      const response = await request(app).get(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.PAGE_TITLE')}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.TITLE'));
    });

    it('should display paragraph', () => {
      const body = mainWrapper.getElementsByClassName('govuk-body');
      expect(body[0].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_AS_HEADER'));
    });

    it('should display radio buttons, with correct labels', () => {
      const radioButtons = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_AS_AN_INDIVIDUAL'));
      expect(radioButtons[0].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_FOR_YOURSELF'));
      expect(radioButtons[1].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_AS_SOLE_TRADER_OR_SELF_EMPLOYED'));
      expect(radioButtons[1].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_FOR_EXAMPLE_TRADEPERSON'));
      expect(radioButtons[2].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_AS_LIMITED_COMPANY'));
      expect(radioButtons[2].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_FOR_EXAMPLE_COMPANY'));
      expect(radioButtons[3].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_AS_ORGANISATION'));
      expect(radioButtons[3].innerHTML).toContain(t('PAGES.CLAIMANT_PARTY_TYPE_SELECTION.CLAIMING_FOR_EXAMPLE_PARTNERSHIP_TRUST_CHARITY_CLUB_OR_ASSOCIATION'));
    });

    it('should display save and continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[0];
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
        .reply(200, { id_token: citizenRoleToken });
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).post(CLAIMANT_PARTY_TYPE_SELECTION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0].getElementsByTagName('a')[0];
      expect(errorSummaryTitle.innerHTML).toContain(t('ERRORS.THERE_WAS_A_PROBLEM'));
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_CHOOSE'));
      expect(errorSummaryMessage.getAttribute('href')).toBe('#option');
    });

    it('should display error message', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain(t('ERRORS.VALID_CHOOSE'));
    });
  });
});
