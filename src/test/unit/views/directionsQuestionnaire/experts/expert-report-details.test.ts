import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {DQ_EXPERT_REPORT_DETAILS_URL} from '../../../../../main/routes/urls';
import {YesNo} from '../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

const {JSDOM} = require('jsdom');

describe('Expert Report Details View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeAll(async () => {
      const response = await request(app).get(DQ_EXPERT_REPORT_DETAILS_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Have you already got a report written by an expert?');
    });

    it('should have correct main header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
      expect(header.innerHTML).toContain('Have you already got a report written by an expert?');
    });

    it('should display yes/no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe(YesNo.YES);
      expect(radios[1].getAttribute('value')).toBe(YesNo.NO);
    });

    it('should display fieldset name as Report', () => {
      const fieldSet = htmlDocument.getElementsByClassName('govuk-fieldset__legend')[0];
      expect(fieldSet.innerHTML).toContain('Report');
    });

    it('should display expert\'s name input field', () => {
      const nameInput = htmlDocument.getElementsByClassName('govuk-label')[1];
      expect(nameInput.innerHTML).toContain('Expert\'s name');
    });

    describe('Date section', () => {
      const today = new Date();
      const threeMonthsAgo = today.getDate() + ' ' + (today.getMonth() - 2) + ' ' + today.getFullYear();
      it('should display date fields', async () => {
        const dateLegend = htmlDocument.getElementsByClassName('govuk-label')[2];
        const hint = htmlDocument.getElementsByClassName('govuk-hint');
        const dateInput = htmlDocument.getElementsByClassName('govuk-date-input__input');
        const dateLabel = htmlDocument.getElementsByClassName('govuk-date-input__label');
        expect(dateLegend.innerHTML).toContain('When is the report dated?');
        expect(hint).toBeDefined();
        expect(hint[1].innerHTML).toContain(`For Example, ${threeMonthsAgo}`);
        expect(dateInput.length).toEqual(3);
        expect(dateLabel.length).toEqual(3);
        expect(dateLabel[0].innerHTML).toContain('Day');
        expect(dateLabel[1].innerHTML).toContain('Month');
        expect(dateLabel[2].innerHTML).toContain('Year');
      });
    });

    it('should display remove button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button--secondary')[0];
      expect(button.innerHTML).toContain('Remove');
    });

    it('should display add another report button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button--secondary')[1];
      expect(button.innerHTML).toContain('Add another report');
    });

    it('should display save continue button', () => {
      const button = mainWrapper.getElementsByClassName('govuk-button')[2];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const summary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(summary.innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    const mockReportDetails = [
      {
        expertName: '',
        year: '2023',
        month: '03',
        day: '01',
      },
      {
        expertName: 'John Doe',
        year: '',
        month: '',
        day: '',
      },
    ];

    beforeAll(async () => {
      const response = await request(app).post(DQ_EXPERT_REPORT_DETAILS_URL)
        .send({
          option: YesNo.YES,
          reportDetails: mockReportDetails,
        });
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessages = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li');
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessages[2].innerHTML).toContain('Enter the expert’s name');
      expect(errorSummaryMessages[2].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('reportDetails[0][expertName]');
      expect(errorSummaryMessages[3].innerHTML).toContain('Correct the date. You can’t use a future date.');
      expect(errorSummaryMessages[3].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#reportDetails[0][reportDate]');
      expect(errorSummaryMessages[5].innerHTML).toContain('Enter a date');
      expect(errorSummaryMessages[5].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('reportDetails[1][reportDate]');
    });

    it('should display from group errors', () => {
      const formGroupErrors = htmlDocument.getElementsByClassName('govuk-form-group--error');
      const firstError = formGroupErrors[0].getElementsByClassName('govuk-error-message');
      const secondError = formGroupErrors[1].getElementsByClassName('govuk-error-message');
      const thirdError = formGroupErrors[2].getElementsByClassName('govuk-error-message');
      expect(formGroupErrors.length).toBe(3);
      expect(firstError[0].innerHTML).toContain('Enter the expert’s name');
      expect(secondError[1].innerHTML).toContain('Correct the date. You can’t use a future date.');
      expect(thirdError[1].innerHTML).toContain('Enter a date');
    });
  });
});
