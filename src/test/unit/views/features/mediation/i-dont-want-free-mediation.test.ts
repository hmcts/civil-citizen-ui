import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {DONT_WANT_FREE_MEDIATION_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('I Dont Want Free Mediation View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).get(DONT_WANT_FREE_MEDIATION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - I don\'t want free mediation');
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-m')[0];
      expect(header.innerHTML).toContain('I do not agree to free mediation');
    });

    it('should display no free mediation paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-hint')[0];
      expect(paragraph.innerHTML).toContain('You have chosen not to try free mediation. Please tell us why:');
    });

    it('should display radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      const conditional = htmlDocument.getElementsByClassName('govuk-radios__conditional')[0];
      expect(radios.length).toEqual(6);
      expect(radios[0].innerHTML).toContain('I have already tried to resolve the dispute with the other party, with no success\n');
      expect(radios[1].innerHTML).toContain('I am not sure what would happen in mediation');
      expect(radios[2].innerHTML).toContain('I do not think mediation would solve the dispute');
      expect(radios[3].innerHTML).toContain('I do not want to delay getting a hearing');
      expect(radios[4].innerHTML).toContain('I want a judge to make a decision on the dispute');
      expect(radios[5].innerHTML).toContain('Another reason (please specify)');
      expect(conditional.innerHTML).toContain('Enter your reason here');
    });

    it('should display skip this section link', () => {
      const link = htmlDocument.getElementsByClassName('govuk-form-group')[2].getElementsByClassName('govuk-link')[0];
      expect(link.innerHTML).toContain('Skip this section');
    });

    it('should display save and continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button');
      expect(button[0].innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help detail', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });

    it('should display improve our services text', () => {
      const text = htmlDocument.getElementsByClassName('font-xsmall')[0];
      expect(text.innerHTML).toContain('Any information you provide is used solely by HM Courts and Tribunals Service');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).post(DONT_WANT_FREE_MEDIATION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary if no radio selection', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].innerHTML)
        .toContain('Please select one reason');
    });

    it('should display error message for radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Please select one reason');
    });
  });
});
