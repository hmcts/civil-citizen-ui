import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  AGREED_TO_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
} from '../../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Agreed response deadline View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(AGREED_TO_MORE_TIME_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Agree more time to respond');
    });

    it('should have back link', () => {
      const links = htmlDocument.getElementsByClassName('govuk-back-link');
      const backLink = links[0] as HTMLAnchorElement;
      expect(backLink.innerHTML).toContain('Back');
      expect(backLink.href).toEqual(RESPONSE_DEADLINE_OPTIONS_URL);
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('You have already agreed to more time to respond');
    });

    it('should display sub title', async () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-fieldset__legend govuk-fieldset__legend--m');
      expect(paragraph[0].innerHTML).toContain("Enter the respond date you have agreed with Mr. Jan Clark's legal representative");
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

    describe('Date section', () => {
      it('should display date fields', async () => {
        const hint = htmlDocument.getElementsByClassName('govuk-hint');
        const dateInput = htmlDocument.getElementsByClassName('govuk-date-input__input');
        const dateLabel = htmlDocument.getElementsByClassName('govuk-date-input__label');
        expect(hint).toBeDefined();
        expect(hint[0].innerHTML).toContain('For example');
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
      await request(app).post(AGREED_TO_MORE_TIME_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
      expect(errorSummary[0].innerHTML).toContain('There was a problem');
    });

    it('should display correct error summary message with correct link for agreed response date', () => {
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_AGREED_RESPONSE_DATE);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#date');
    });

    it('should display correct error summary message with correct link for agreed response Date in the past', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send({ day: '14', month: '02', year: '2022'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#date');
    });

    it('should display correct error summary message with correct link for agreed response date is more than 28 days', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send({day: '14', month: '06', year: 2022})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.DATE_NOT_MORE_THAN_28_DAYS);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#date');
    });

    it('should display correct error summary message with correct link for day', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send({day: '35', month: '06', year: 2022})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_DAY);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#day');
    });

    it('should display correct error summary message with correct link for month', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send({day: '12', month: '13', year: 2022})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_MONTH);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#month');
    });

    it('should display correct error summary message with correct link for Year less than 4 digits', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send({day: '01', month: '01', year: '999'})
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#year');
    });
  });
});
