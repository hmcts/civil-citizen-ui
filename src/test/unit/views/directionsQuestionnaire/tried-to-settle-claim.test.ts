import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {mockCivilClaim} from '../../../utils/mockDraftStore';
import {DQ_TRIED_TO_SETTLE_CLAIM_URL} from '../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Tried to settle the claim view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: any;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(DQ_TRIED_TO_SETTLE_CLAIM_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Tried to settle this claim?');
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Have you tried to settle this claim before going to court?');
    });

    it('should display paragraph with steps', () => {
      const paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('Both parties must take certain steps before going to court.');
    });

    it('should display list of three steps', () => {
      const steps = htmlDocument.getElementsByClassName('govuk-list--bullet')[0].getElementsByTagName('li');
      expect(steps.length).toBe(3);
      expect(steps[0].innerHTML).toContain('discuss the claim and negotiate with each other');
      expect(steps[1].innerHTML).toContain('try to reach an agreement about the claim');
      expect(steps[2].innerHTML).toContain('consider another form of dispute resolution, such as mediation');
    });

    it('should display yes no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[1].getAttribute('value')).toBe('no');
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
      const response = await request(app).post(DQ_TRIED_TO_SETTLE_CLAIM_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error in the error summary', () => {
      const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0];
      expect(error.innerHTML).toContain('Select yes if you have tried to settle this claim before going to court');
    });

    it('should display error over radios', () => {
      const error = htmlDocument.getElementById('option-error');
      expect(error?.innerHTML).toContain('Select yes if you have tried to settle this claim before going to court');
    });
  });
});
