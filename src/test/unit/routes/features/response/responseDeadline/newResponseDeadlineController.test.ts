import { app } from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { CIVIL_SERVICE_CALCULATE_DEADLINE } from '../../../../../../main/app/client/civilServiceUrls';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import { Claim } from '../../../../../../main/common/models/claim';
import {
  CLAIM_TASK_LIST_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../../../../main/routes/urls';
import { CounterpartyType } from '../../../../../../main/common/models/counterpartyType';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';

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
    it('should show error when proposed extended deadline does not exist', async () => {
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
    // it('should return 500 code when there is an error', async () => {
    //   app.locals.draftStoreClient = mockCivilClaim;
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send()
    //     .expect((res) => {
    //       expect(res.status).toBe(500);
    //       expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    //     });
    // });
    it('should redirect to task list if cookies doesnt exist', async () => {
      const claim = new Claim();
      claim.responseDeadline = {
        agreedResponseDeadline: extendedDate,
      };
      mockGetCaseDataFromStore.mockImplementation(async () => claim);

      // const newDeadlineDate = {date: '2022-08-21T22:00:00.000Z', year: 2022, month: 8, day: 22, originalResponseDeadline: '2022-08-20T15:59:59'}
      // app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(NEW_RESPONSE_DEADLINE_URL)
        .set('Cookie', [`newDeadlineDate=j%3A%7B%22date%22%3A%222022-08-21T22%3A00%3A00.000Z%22%2C%22year%22%3A2022%2C%22month%22%3A8%2C%22day%22%3A22%2C%22originalResponseDeadline%22%3A%222022-08-20T15%3A59%3A59%22%7D`])
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
        });
    });

    // it('should return 500 code when there is an error', async () => {
    //   app.locals.draftStoreClient = mockRedisFailure;
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send()
    //     .expect((res) => {
    //       expect(res.status).toBe(500);
    //       expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    //     });
    // });

    // it('should return error on agreed date in the past', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=1999')
    //     .send('month=1')
    //     .send('day=1')
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });

    // it('should return error on agreed date in the past', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=2022')
    //     .send('month=05')
    //     .send('day=10')
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });
    // it('should return error on incorrect input', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=199')
    //     .send('month=1')
    //     .send('day=1')
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });
    // it('should return error on agreed response date is bigger 28 days', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=2050')
    //     .send('month=6')
    //     .send('day=13')
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });

    // it('should accept the 28th day after the original response deadline as input and redirect to next page', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=2025')
    //     .send('month=6')
    //     .send('day=12')
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });

    // it('should accept the input date when it is less then 28 after original response deadline and redirect to next page', async () => {
    //   await request(app)
    //     .post(NEW_RESPONSE_DEADLINE_URL)
    //     .send('year=2025')
    //     .send('month=6')
    //     .send('day=11')
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toBe(CLAIM_TASK_LIST_URL);
    //     });
    // });
  });
});
