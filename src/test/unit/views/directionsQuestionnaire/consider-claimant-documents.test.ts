import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {mockCivilClaim} from '../../../utils/mockDraftStore';
import {DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../../../main/routes/urls';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Consider Claimant Documents  view', () => {
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
      const response = await request(app).get(DQ_CONSIDER_CLAIMANT_DOCUMENTS);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Are there any documents the claimant has that you want the court to consider?');
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Are there any documents the claimant has that you want the court to consider?');
    });

    it('should display yes no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[1].getAttribute('value')).toBe('no');
    });

    it('should display text area if no radio is selected', () => {
      const noRadio = htmlDocument.getElementsByClassName('govuk-radios__input')[1];
      const textAreaLabel = htmlDocument.querySelector('label[for=details]');
      noRadio.setAttribute('aria-expanded', 'true');
      expect(textAreaLabel?.innerHTML).toContain('Give details of the documents');
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
    describe('no radio selected', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DQ_CONSIDER_CLAIMANT_DOCUMENTS);
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display error summary', () => {
        const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
        expect(errorSummary.innerHTML).toContain('There was a problem');
      });

      it('should display choose option error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain(t('ERRORS.SELECT_YES_IF_DOCUMENTS'));
      });

      it('should display choose option error above radio buttons', () => {
        const error = htmlDocument.getElementById('option-error');
        expect(error?.innerHTML).toContain(t('ERRORS.SELECT_YES_IF_DOCUMENTS'));
      });
    });

    describe('yes option selected', () => {
      let htmlDocument: Document;

      beforeEach(async () => {
        nock(idamUrl)
          .post('/o/token')
          .reply(200, {id_token: citizenRoleToken});
        app.locals.draftStoreClient = mockCivilClaim;
        const response = await request(app).post(DQ_CONSIDER_CLAIMANT_DOCUMENTS)
          .send({option: 'yes'});
        const dom = new JSDOM(response.text);
        htmlDocument = dom.window.document;
      });

      it('should display tell us why error in the error summary', () => {
        const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(error.innerHTML).toContain(t('ERRORS.GIVE_DETAILS_DOCUMENTS'));
      });

      it('should display tell us why error over text area', () => {
        const error = htmlDocument.getElementById('details-error');
        expect(error?.innerHTML).toContain(t('ERRORS.GIVE_DETAILS_DOCUMENTS'));
      });
    });
  });
});
