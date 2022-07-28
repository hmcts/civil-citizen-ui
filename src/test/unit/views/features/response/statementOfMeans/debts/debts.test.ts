import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_DEBTS_URL} from '../../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {
  buildDebtFormUndefined,
  buildDebtFormYesWithDebtEmpty,
  buildDebtFormYesWithoutItems,
  buildDebtFormYesWithTotalOwnedInvalidAndNoMonthlyPaymentsAndNoDebt,
} from '../../../../../../utils/mockForm';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
describe('Debts View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_DEBTS_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display header', async () => {
      expect(htmlDocument.title).toContain(t('PAGES.DEBTS.PAGE_TITLE'));
    });

    it('should display title', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(t('PAGES.DEBTS.TITLE'));
    });

    it('should display yes/no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
    });

    it('should display radio button 1 conditional', () => {
      const conditionalContent = htmlDocument.getElementsByClassName('govuk-radios__conditional');
      const formGroupRows = conditionalContent[0].getElementsByClassName('govuk-form-group ');
      const labelRow = formGroupRows[0].getElementsByTagName('label');
      expect(labelRow[0].innerHTML).toContain(t('PAGES.DEBTS.LIST'));
      expect(labelRow[1].innerHTML).toContain(t('PAGES.DEBTS.TOTAL'));
      expect(labelRow[2].innerHTML).toContain(t('PAGES.DEBTS.MONTHLY'));
      const inputs = formGroupRows[0].getElementsByClassName('govuk-input');
      expect(inputs.length).toBe(6);
      const hint = formGroupRows[0].getElementsByClassName('govuk-input__prefix');
      expect(hint[0].innerHTML).toContain('£');
      expect(hint[1].innerHTML).toContain('£');
      expect(hint[2].innerHTML).toContain('£');
      expect(hint[3].innerHTML).toContain('£');
      const button = conditionalContent[0].getElementsByClassName('govuk-button--secondary');
      expect(button[0].innerHTML).toContain(t('PAGES.DEBTS.ADD'));
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[1].innerHTML).toContain('Save and continue');
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
    let htmlDocument: Document;
    app.locals.draftStoreClient = mockCivilClaim;
    beforeEach(async () => {
      const response = await request(app).post(CITIZEN_DEBTS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary if yes and no debt is include', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithoutItems())
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].innerHTML)
        .toContain(t('ERRORS.ENTER_AT_LEAST_ONE_DEBT'));
    });

    it('should display error summary if option is yes but debt is empty ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithDebtEmpty())
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].innerHTML)
        .toContain(t('ERRORS.ENTER_A_DEBT'));
    });

    test('should display error summary if option is yes but Total owned is invalid ', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormYesWithTotalOwnedInvalidAndNoMonthlyPaymentsAndNoDebt())
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[2].innerHTML)
        .toContain(t('ERRORS.ENTER_A_DEBT'));
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[3].innerHTML)
        .toContain(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[4].innerHTML)
        .toContain(t('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER'));
      expect(errorSummary.getElementsByTagName('a')[2].getAttribute('href'))
        .toContain('#debtsItems[0][debt]');
      expect(errorSummary.getElementsByTagName('a')[3].getAttribute('href'))
        .toContain('#debtsItems[0][totalOwned]');
      expect(errorSummary.getElementsByTagName('a')[4].getAttribute('href'))
        .toContain('#debtsItems[0][monthlyPayments]');
    });

    it('should display error message for radios carer', async () => {
      await request(app)
        .post(CITIZEN_DEBTS_URL)
        .send(buildDebtFormUndefined())
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Choose option: Yes or No');
    });

  });

});
