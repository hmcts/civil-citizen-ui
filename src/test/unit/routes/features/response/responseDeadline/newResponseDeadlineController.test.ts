import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CALCULATE_DEADLINE,} from '../../../../../../main/app/client/civilServiceUrls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {NEW_RESPONSE_DEADLINE_URL} from '../../../../../../main/routes/urls';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Response - New response deadline', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200,  new Date(2022, 9, 31));
  });
  test('should return new deadline date successfully', async () => {
    const extendedDate = new Date(2022, 9, 31);
    const expectedDate = '31 October 2022';
    const claim = new Claim();
    claim.applicant1 = {
      partyName: 'Mr. James Bond',
      type: CounterpartyType.INDIVIDUAL,
    };
    claim.responseDeadline = {
      agreedResponseDeadline : extendedDate,
    };
    mockGetCaseDataFromStore.mockImplementation(async () => claim);

    await request(app).get(NEW_RESPONSE_DEADLINE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedDate);
        expect(res.text).toContain(claim.getClaimantName());
      });
  });
  test('should show error when proposed extended deadline does not exist', async () =>{
    const claim = new Claim();
    claim.applicant1 = {
      partyName: 'Mr. James Bond',
      type: CounterpartyType.INDIVIDUAL,
    };
    mockGetCaseDataFromStore.mockImplementation(async () => claim);
    await request(app).get(NEW_RESPONSE_DEADLINE_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
  test('should show error when draft store throws error', async () =>{
    mockGetCaseDataFromStore.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app).get(NEW_RESPONSE_DEADLINE_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
