import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_PHONE_NUMBER_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
describe('Citizen Phone View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_PHONE_NUMBER_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display header', async () => {
      expect(htmlDocument.title).toContain(t('PAGES.CITIZEN_PHONE.PAGE_TITLE'));
    });

    it('should display we will call you if we need more information text', async () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body');
      expect(paragraph[0].innerHTML).toContain(t('PAGES.CITIZEN_PHONE.MORE_INFORMATION'));
    });

    it('should display We will give your phone number to the person text', async () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body');
      expect(paragraph[1].innerHTML).toContain(t('PAGES.CITIZEN_PHONE.INFORMATION'));
    });

    it('should display hint text', async () => {
      const hint = htmlDocument.getElementsByClassName('govuk-hint');
      expect(hint[0].innerHTML).toContain(t('PAGES.CITIZEN_PHONE.EXAMPLE'));
    });

    it('should display telephone input text', async () => {
      const prefix = htmlDocument.getElementsByClassName('govuk-input');
      const input = htmlDocument.getElementById('telephoneNumber');
      expect(prefix[0].innerHTML).toContain('');
      expect(input).toBeDefined();
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Save and continue');
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });


  });

  describe('on POST', () => {
    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_PHONE_NUMBER_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });


    it('should display correct error summary message with correct link for telephone error', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send({telephoneNumber: '-333'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#telephoneNumber');
    });
  });

});
