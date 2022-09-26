import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {EXPERT_DETAILS_URL} from '../../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Experts Details view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(EXPERT_DETAILS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Enter the expert’s details');
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.PAGE_TITLE'));
    });

    it('should display labels', () => {
      const input = htmlDocument.getElementsByClassName('govuk-label');
      expect(input[0].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL'));
      expect(input[1].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL'));
      expect(input[2].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL'));
      expect(input[3].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL'));
      expect(input[4].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE'));
      expect(input[5].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT'));
      expect(input[6].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.COST_OPTIONAL'));
    });

    it('should display form', () => {
      const inputs = htmlDocument.getElementsByClassName('govuk-input');
      const textarea = htmlDocument.getElementsByClassName('govuk-textarea');
      expect(inputs).toHaveLength(6);
      expect(textarea).toHaveLength(1);
    });

    it('should display save and continue button', () => {
      const buttons = mainWrapper.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain(t('PAGES.EXPERT_DETAILS.ADD_ANOTHER_EXPERT'));
      expect(buttons[1].innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details');
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
      const response = await request(app).post(EXPERT_DETAILS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    // it('should display error in the error summary', () => {
    //   const error = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
    //     .getElementsByTagName('li')[0];
    //   expect(error.innerHTML).toContain('TestMessages.VALID_YES_NO_OPTION');
    // });

    // it('should display error over radios', () => {
    //   const error = htmlDocument.getElementById('option-error');
    //   expect(error?.innerHTML).toContain('TestMessages.VALID_YES_NO_OPTION');
    // });

  });
});
