import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {mockCivilClaim} from '../../../utils/mockDraftStore';
import {DQ_WELSH_LANGUAGE_URL} from '../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Welsh Language view', () => {
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
      const response = await request(app).get(DQ_WELSH_LANGUAGE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - ' + t('PAGES.WELSH_LANGUAGE.PAGE_TITLE'));
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.WELSH_LANGUAGE.PAGE_TITLE'));
    });

    it('should display radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('en');
      expect(radios[1].getAttribute('value')).toBe('cy');
      expect(radios[2].getAttribute('value')).toBe('cy-en');
      expect(radios[3].getAttribute('value')).toBe('en');
      expect(radios[4].getAttribute('value')).toBe('cy');
      expect(radios[5].getAttribute('value')).toBe('cy-en');
    });

    it('should display save and continue button', () => {
      const saveButton = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(saveButton.innerHTML).toContain('Save and continue');
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
      const response = await request(app).post(DQ_WELSH_LANGUAGE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error in the error summary', () => {
      const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0];
      const errorSpeak = error.getElementsByTagName('li')[0];
      const errorDocuments = error.getElementsByTagName('li')[1];
      expect(errorSpeak.innerHTML).toContain(t('ERRORS.SELECT_LANGUAGE_SPEAK'));
      expect(errorDocuments.innerHTML).toContain(t('ERRORS.SELECT_LANGUAGE_DOCUMENTS'));
    });

    it('should display error over radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message');
      expect(errorMessage[0].innerHTML).toContain(t('ERRORS.SELECT_LANGUAGE_SPEAK'));
      expect(errorMessage[1].innerHTML).toContain(t('ERRORS.SELECT_LANGUAGE_DOCUMENTS'));
    });
  });
});
