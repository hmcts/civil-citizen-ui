import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CALCULATE_DEADLINE} from '../../../../../../main/app/client/civilServiceUrls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {NEW_RESPONSE_DEADLINE_URL} from '../../../../../../main/routes/urls';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('New response deadline view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  let htmlDocument: Document;

  beforeEach(async () => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200,  new Date(2022, 9, 31));
    const extendedDate = new Date(2022, 9, 31);
    const claim = new Claim();
    claim.applicant1 = {
      partyName: 'Mr. James Bond',
      type: CounterpartyType.INDIVIDUAL,
    };
    claim.responseDeadline = {
      agreedResponseDeadline : extendedDate,
    };
    mockGetCaseDataFromStore.mockImplementation(async () => claim);
    const response = await request(app).get(NEW_RESPONSE_DEADLINE_URL);
    const dom = new JSDOM(response.text);
    htmlDocument = dom.window.document;
  });
  it('should have correct title',  () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-l');
    expect(header[0].innerHTML).toContain('New response deadline');
  });
  it('should have correct subtitle', () => {
    const subHeader =  htmlDocument.getElementsByClassName('govuk-heading-m');
    expect(subHeader[0].innerHTML).toContain('4 pm on 31 October 2022');
  });
  it('should have Continue button', () => {
    const continueButton = htmlDocument.getElementsByClassName('govuk-button');
    expect(continueButton[0].innerHTML).toContain('Continue');
  });
  it('should have Contact for help', ()=>{
    const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
    expect(details[0].innerHTML).toContain('Contact us for help');
  });
  it('should have Back button', ()=>{
    const backButton = htmlDocument.getElementsByClassName('govuk-back-link');
    expect(backButton[0].innerHTML).toContain('Back');
  });
});
