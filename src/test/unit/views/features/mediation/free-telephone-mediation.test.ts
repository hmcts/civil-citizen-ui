import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import request from 'supertest';
import {CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaimApplicantCompanyType,
  mockCivilClaimApplicantIndividualType,
} from '../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'Free telephone mediation';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Free Telephone Mediation View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;
      const response = await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain(pageTitle);
    });

    it('should display two h2 headers', () => {
      const headers = htmlDocument.querySelectorAll('h2.govuk-heading-m');
      expect(headers.length).toEqual(2);
      expect(headers[0].innerHTML).toContain('How free mediation works');
      expect(headers[1].innerHTML).toContain('Reaching a settlement');
    });

    it('should display automatically registered paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain('We have automatically registered you for free telephone ' +
        'mediation from HM Courts and Tribunals Service.');
    });

    it('should display trained neutral mediator paragraph', () => {
      expect(paragraphs[1].innerHTML).toContain('A trained, neutral mediator from HM Courts and Tribunals ' +
        'Service will listen to your views and help you to negotiate a settlement of your dispute.');
    });

    it('should display two inset texts', () => {
      const insetText = htmlDocument.getElementsByClassName('govuk-inset-text');
      expect(insetText.length).toEqual(2);
      expect(insetText[0].innerHTML).toContain('Mediation can be quicker, cheaper and less stressful than going to court.');
      expect(insetText[1].innerHTML).toContain('You will not have to wait longer for a court hearing if you choose mediation.');
    });

    it('should display confidential mediation paragraph', () => {
      expect(paragraphs[2].innerHTML).toContain('Mediation is confidential, and nothing said in the ' +
        'mediation can be used in court proceedings if the dispute cannot be settled. The mediator speaks to ' +
        'each party separately, this is not a conference call.');
    });

    it('should display must agree paragraph', () => {
      expect(paragraphs[3].innerHTML).toContain('The claimant must agree to mediation. We\'ll contact you ' +
        'within 28 days after the claimant\'s confirmation, to arrange a free appointment.');
    });

    it('should display mediation duration paragraph', () => {
      expect(paragraphs[4].innerHTML).toContain('Your mediation appointment will last for no more than an hour.');
    });

    it('should display find out more paragraph with external link', () => {
      const externalLink = paragraphs[5].querySelectorAll('a.govuk-link')[0];
      expect(paragraphs[5].innerHTML).toContain('Find out more about');
      expect(externalLink.innerHTML).toContain('free telephone mediation (opens in new tab).');
      expect(externalLink.getAttribute('href')).toContain('https://www.gov.uk/guidance/small-claims-mediation-service');
      expect(externalLink.getAttribute('target')).toContain('_blank');
    });

    it('should display successful mediation paragraph', () => {
      expect(paragraphs[6].innerHTML).toContain('If mediation is successful, you\'ll make a verbal agreement ' +
        'over the phone. This is legally binding which means that you must comply with it. You will be given the ' +
        'terms of the agreement in a document – this is called a settlement agreement.');
    });

    it('should display breaking the terms paragraph', () => {
      expect(paragraphs[7].innerHTML).toContain('If either party breaks the terms the other party can go to ' +
        'court to ask for a judgment or hearing.');
    });

    it('should display mediation fails paragraph', () => {
      expect(paragraphs[8].innerHTML).toContain('If mediation fails and a court hearing is needed, what ' +
        'happened during the mediation appointment cannot be mentioned in court.');
    });

    it('should display do not agree to free mediation link with correct path', () => {
      const link = paragraphs[9].querySelectorAll('a.govuk-link')[0];
      expect(link.innerHTML).toContain('I do not agree to free mediation');
      expect(link.getAttribute('href')).toContain('/mediation-disagreement');
    });

    it('should display contact us for help details component', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });

    it('should display continue button with correct path for the business', () => {
      const continueButton = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(continueButton.innerHTML).toContain('Continue');
      expect(continueButton.getAttribute('href')).toContain('/can-we-use-company');
    });

    it('should display continue button with correct path for the individual', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
      const response = await request(app).get(CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      const continueButton = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(continueButton.innerHTML).toContain('Continue');
      expect(continueButton.getAttribute('href')).toContain('/can-we-use');
    });
  });
});
