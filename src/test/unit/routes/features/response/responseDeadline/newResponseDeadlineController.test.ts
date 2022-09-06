import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CIVIL_SERVICE_CALCULATE_DEADLINE} from '../../../../../../main/app/client/civilServiceUrls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {
  CLAIM_TASK_LIST_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../../../../main/routes/urls';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const extendedDate = new Date(2022, 9, 31);

describe('Response - New response deadline', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');
  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200, new Date(2022, 9, 31));
  });
  describe('on GET', () => {
    it('should return new deadline date successfully', async () => {
      const expectedDate = '31 October 2022';
      const claim = new Claim();
      claim.applicant1 = {
        partyName: 'Mr. James Bond',
        type: CounterpartyType.INDIVIDUAL,
      };
      claim.responseDeadline = {
        agreedResponseDeadline: extendedDate,
      };
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedDate);
          expect(res.text).toContain(claim.getClaimantName());
        });
    });
    it('should throw error when agreedResponseDeadline does not exist', async () => {
      const claim = new Claim();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      await request(app).get(NEW_RESPONSE_DEADLINE_URL)
        .set('Cookie', ['newDeadlineDate='])
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    it('should show error when draft store throws error', async () => {
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
  describe('on POST', () => {
    it('should redirect to task list if cookies has newDeadlineDate and NO validation errors', async () => {
      const claim = new Claim();
      claim.responseDeadline = {
        agreedResponseDeadline: extendedDate,
      };
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      await request(app)
        .post(NEW_RESPONSE_DEADLINE_URL)
        .set('Cookie', ['newDeadlineDate=j%3A%7B%22date%22%3A%222022-08-21T22%3A00%3A00.000Z%22%2C%22year%22%3A2022%2C%22month%22%3A8%2C%22day%22%3A22%2C%22originalResponseDeadline%22%3A%222022-08-20T15%3A59%3A59%22%7D'])
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
        });
    });
    it('should return 500 code when there is an error', async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(NEW_RESPONSE_DEADLINE_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
