import config from 'config';
import {t} from 'i18next';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CLAIMANT_PHONE_NUMBER_URL,
} from '../../../../../../main/routes/urls';
import { getUserId } from '../../../../../../main/services/features/claim/claimantPhoneService';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/services/features/claim/claimantPhoneService', () => ({
  ...jest.requireActual('../../../../../../main/services/features/claim/claimantPhoneService'),
  getUserId: jest.fn(),
}));

describe('Claimant Phone View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetUserId = getUserId as jest.Mock;

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;
    beforeEach(async () => {
      mockGetUserId.mockImplementation(async () => {
        return '123';
      });
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      const response = await request(app).get(CLAIMANT_PHONE_NUMBER_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${t('PAGES.CLAIMANT_PHONE.PAGE_TITLE')}`);
    });

    it('should display heading', () => {
      const body = mainWrapper.getElementsByClassName('govuk-heading-l');
      expect(body[0].innerHTML).toContain(t('PAGES.CLAIMANT_PHONE.TITLE'));
    });

    it('should display paragraphs', () => {
      const body = mainWrapper.getElementsByClassName('govuk-body');
      expect(body[0].innerHTML).toContain(t('PAGES.CLAIMANT_PHONE.NUMBER_INFORMATION'));
      expect(body[1].innerHTML).toContain(t('PAGES.CLAIMANT_PHONE.INFORMATION'));
    });

    it('should display form elements', () => {
      const formElm = mainWrapper.getElementsByClassName('govuk-form-group');
      expect(formElm.length).toBe(3);
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
});
