import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_ALREADY_PAID_URL} from '../../../../../../../main/routes/urls';

const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{}')),
  set: jest.fn(() => Promise.resolve()),
};
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const citizenRoleToken: string = config.get('citizenRoleToken');
const idamUrl: string = config.get('idamUrl');
let htmlRes: Document;

describe('Already Paid View', () => {
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeAll(async () => {
      await request(app).get(CITIZEN_ALREADY_PAID_URL).then(res => {
        const dom = new JSDOM(res.text);
        console.log('res.text', res.text);
        htmlRes = dom.window.document;
      });
    });

    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    it('should display header', () => {
      const header = htmlRes.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Have you paid the claimant the amount you admit you owe?');
    });

    it('should display 2 radio buttons with yes and no options', () => {
      const radios = htmlRes.getElementsByClassName('govuk-radios__item');
      expect(radios.length).toEqual(2);
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
    });

    it('should display save and continue button', () => {
      const buttons = htmlRes.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Save and continue');
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlRes.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlRes.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });
  });

  describe('on POST', () => {
    beforeAll(async () => {
      await request(app).post(CITIZEN_ALREADY_PAID_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlRes = dom.window.document;
      });
    });

    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
    });

    it('should display error summary component', () => {
      const errorSummary = htmlRes.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });

    it('should display correct error summary message with correct link', () => {
      const errorSummaryMessage = htmlRes.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0];
      expect(errorSummaryMessage.innerHTML).toContain('Please select yes or no');
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#alreadyPaid');
    });

    it('should display correct error message for radios', () => {
      const errorMessage = htmlRes.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Please select yes or no');
    });
  });
});
