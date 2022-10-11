import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {CLAIM_INTEREST_START_DATE_URL} from '../../../../../../main/routes/urls';
import {Interest} from '../../../../../../main/common/form/models/interest/interest';
import {InterestStartDate} from '../../../../../../main/common/form/models/interest/interestStartDate';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('interest start date view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  let htmlDocument: Document;
  let mainWrapper: Element;

  beforeAll(async () => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CLAIM_INTEREST_START_DATE_URL)
      .reply(200, new Date(2022, 9, 31));
    const claim = new Claim();
    claim.interest = new Interest();
    claim.interest.interestStartDate = new InterestStartDate('1', '1', '2022', 'test');

    mockGetCaseDataFromStore.mockImplementation(async () => claim);
    const response = await request(app).get(CLAIM_INTEREST_START_DATE_URL);
    const dom = new JSDOM(response.text);
    htmlDocument = dom.window.document;
    mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
  });

  it('should have correct title', () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-l');
    expect(header[0].innerHTML).toContain('Enter the date you want to claim interest from');
  });

  it('should have correct subtitle', () => {
    const subHeader = mainWrapper.getElementsByClassName('govuk-label--s');
    expect(subHeader[0].innerHTML).toContain('Explain why you’re claiming from this date');
  });

  it('should have Continue button', () => {
    const button = mainWrapper.getElementsByClassName('govuk-button')[0];
    expect(button.innerHTML).toContain('Save and continue');
  });

  it('should have Contact for help', () => {
    const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
    expect(details[0].innerHTML).toContain('Contact us for help');
  });
  
});
