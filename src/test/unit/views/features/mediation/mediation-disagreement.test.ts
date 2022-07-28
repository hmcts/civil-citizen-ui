import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {MEDIATION_DISAGREEMENT_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Mediation Disagreement View', () => {
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
      const response = await request(app).get(MEDIATION_DISAGREEMENT_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Free mediation disagreement');
    });

    it('should display correct header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
      expect(header.innerHTML).toContain('You chose not to try free mediation');
    });

    it('should display claim will continue paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('The claim will continue and you may have to go to a hearing.');
    });

    it('should display sub header', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-heading-m')[0];
      expect(subHeader.innerHTML).toContain('Advantages of free mediation');
    });

    it('should display advantages paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[1];
      expect(paragraph.innerHTML).toContain('There are many advantages to free mediation, including:');
    });

    it('should display bullet list', () => {
      const listItems = htmlDocument.getElementsByClassName('govuk-list--bullet')[0].getElementsByTagName('li');
      expect(listItems.length).toEqual(5);
      expect(listItems[0].innerHTML).toContain('mediation can be quicker and cheaper than going to court');
      expect(listItems[1].innerHTML).toContain('the mediator speaks to each side separately, you do not speak to the other party during mediation');
      expect(listItems[2].innerHTML).toContain('it gives you control over how your dispute is settled, which is not possible by going to court');
      expect(listItems[3].innerHTML).toContain('it\'s confidential and nothing said or done during mediation can be used in court');
      expect(listItems[4].innerHTML).toContain('County Court Judgment (opens in a new tab)');
    });

    it('should display a link with CCJ url', () => {
      const link = htmlDocument.getElementsByClassName('govuk-list--bullet')[0]
        .getElementsByTagName('li')[4].getElementsByTagName('a')[0];
      expect(link.innerHTML).toContain('County Court Judgment (opens in a new tab)');
      expect(link.getAttribute('href')).toEqual('https://www.gov.uk/county-court-judgments-ccj-for-debt');
      expect(link.getAttribute('target')).toEqual('_blank');
    });

    it('should display second sub header', () => {
      const subHeader = htmlDocument.getElementsByClassName('govuk-heading-m')[1];
      expect(subHeader.innerHTML).toContain('Will you change your decision and try free mediation?');
    });

    it('should display no to mediation paragraph', () => {
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[2];
      expect(paragraph.innerHTML).toContain('If you choose not to try mediation this cannot be changed once your response is submitted.');
    });

    it('should display yes/no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__item');
      const conditional = htmlDocument.getElementsByClassName('govuk-radios__conditional')[0];
      expect(radios[0].innerHTML).toContain('Yes');
      expect(radios[1].innerHTML).toContain('No');
      expect(conditional.innerHTML).toContain('We\'ll ask the claimant if they\'ll try free mediation. If they say no, the claim will go to a hearing.');
    });

    it('should display save and continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button')[0];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help detail', () => {
      const detailsSummary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(detailsSummary.innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).post(MEDIATION_DISAGREEMENT_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary if no radio selection', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary')[0];
      expect(errorSummary.getElementsByClassName('govuk-error-summary__title')[0].innerHTML)
        .toContain('There was a problem');
      expect(errorSummary.getElementsByClassName('govuk-list govuk-error-summary__list')[0].innerHTML)
        .toContain('Choose option: Yes or No');
    });

    it('should display error message for radios', () => {
      const errorMessage = htmlDocument.getElementsByClassName('govuk-error-message')[0];
      expect(errorMessage.innerHTML).toContain('Yes or No');
    });
  });
});
