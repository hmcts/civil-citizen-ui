import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_REPAYMENT_PLAN_FULL_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {DateFormatter} from '../../../../../../main/common/utils/dateFormatter';
import {t} from 'i18next';
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Repayment Plan View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_REPAYMENT_PLAN_FULL_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.TITLE'));
    });

    it('should display total amount claimed text', async () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body-m');
      expect(paragraph[0].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.SUBTITLE',{totalAmount: '110'}));
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain(t('COMMON.CONTACT_US_FOR_HELP.TITLE'));
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });

    describe('Regular Payment Section', () => {
      it('should display "regular payments of" text', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-!-margin-0 govuk-body-m');
        expect(paragraph[0].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.REGULAR_PAYMENTS') + ':');
      });
      it('should display hint text', async () => {
        const hint = htmlDocument.getElementsByClassName('govuk-hint');
        expect(hint[0].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.FOR_EXAMPLE') + '£200');
      });
      it('should display payment amount input text', async () => {
        const prefix = htmlDocument.getElementsByClassName('govuk-input__prefix');
        const input = htmlDocument.getElementById('paymentAmount');
        expect(prefix[0].innerHTML).toContain('£');
        expect(input).toBeDefined();
      });
    });

    describe('Payment Frequency Section', () => {
      it('should display "How often you\'ll make payments" text', async () => {
        const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
        const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
        const labels = htmlDocument.getElementsByClassName('govuk-radios__label');
        expect(header[1].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.HOW_OFTEN_PAYMENTS'));
        expect(radios.length).toEqual(3);
        expect(labels.length).toEqual(3);
        expect(labels[0].innerHTML).toContain(t('COMMON.PAYMENT_FREQUENCY.WEEK'));
        expect(labels[1].innerHTML).toContain(t('COMMON.PAYMENT_FREQUENCY.TWO_WEEKS'));
        expect(labels[2].innerHTML).toContain(t('COMMON.PAYMENT_FREQUENCY.MONTH'));
      });
    });

    describe('Length of repayment plan Section', () => {
      it('should display "Length of repayment plan" text', async () => {
        const paragraph = htmlDocument.getElementsByClassName('govuk-body');
        const strongTag = htmlDocument.getElementsByTagName('strong');
        expect(strongTag).not.toBeNull();
        expect(paragraph[0].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.LENGTH'));
      });
    });

    describe('First Payment Section', () => {
      it('should display "When will you make the first payment?" text', async () => {
        const date = new Date();
        DateFormatter.setMonth(date, 1);
        const getFirstPaymentExampleDate = () => {
          return DateFormatter.setDateFormat(date, 'en-GB', {
            day: 'numeric', month: '2-digit', year: 'numeric',
          });
        };

        const paragraph = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
        const hint = htmlDocument.getElementsByClassName('govuk-hint');
        const dateInput = htmlDocument.getElementsByClassName('govuk-date-input__input');
        const dateLabel = htmlDocument.getElementsByClassName('govuk-date-input__label');
        expect(paragraph[2].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.FIRST_PAYMENT'));
        expect(hint).toBeDefined();
        expect(hint[1].innerHTML).toContain(t('PAGES.REPAYMENT_PLAN.FOR_EXAMPLE') + getFirstPaymentExampleDate());
        expect(dateInput.length).toEqual(3);
        expect(dateLabel.length).toEqual(3);
        expect(dateLabel[0].innerHTML).toContain('Day');
        expect(dateLabel[1].innerHTML).toContain('Month');
        expect(dateLabel[2].innerHTML).toContain('Year');
      });
    });
  });

  describe('on POST', () => {
    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_REPAYMENT_PLAN_FULL_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link for Payment Amount', () => {
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.AMOUNT_REQUIRED'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#paymentAmount');
    });

    it('should display correct error summary message with correct link for Payment Amount with more than 2 decimal digits', async () => {
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_FULL_URL)
        .send({paymentAmount: '99.333', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#paymentAmount');
    });

    it('should display correct error summary message with correct link for Payment Amount greater than Total Claim Amount', async () => {
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_FULL_URL)
        .send({paymentAmount: '1000000000', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '2040'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.EQUAL_INSTALMENTS_REQUIRED'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#paymentAmount');
    });

    it('should display correct error summary message with correct link for Year', () => {
      const errorSummaryMessage = getErrorSummaryListElement(4);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.PAYMENT_FREQUENCY_REQUIRED'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#repaymentFrequency');
    });

    it('should display correct error summary message with correct link for Month', () => {
      const errorSummaryMessage = getErrorSummaryListElement(3);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_YEAR'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#year');
    });

    it('should display correct error summary message with correct link form Day', () => {
      const errorSummaryMessage = getErrorSummaryListElement(2);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_MONTH'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#month');
    });

    it('should display correct error summary message with correct link for Repayment Frequency', () => {
      const errorSummaryMessage = getErrorSummaryListElement(1);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_DAY'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#day');
    });

    it('should display correct error summary message with correct link for First Repayment Date', async () => {
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_FULL_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'WEEK', day: '14', month: '02', year: '1973'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.FIRST_PAYMENT_DATE_IN_THE_FUTURE_REQUIRED'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#firstRepaymentDate');
    });

    it('should display correct error summary message with correct link for Year less than 4 digits', async () => {
      await request(app)
        .post(CITIZEN_REPAYMENT_PLAN_FULL_URL)
        .send({paymentAmount: '100', repaymentFrequency: 'WEEK', day: '01', month: '01', year: '0'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#year');
    });
  });

});
