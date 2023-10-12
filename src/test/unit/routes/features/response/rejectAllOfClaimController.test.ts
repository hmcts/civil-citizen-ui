import {app} from '../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_REJECT_ALL_CLAIM_URL,
  RESPONSE_TASK_LIST_URL,
  SEND_RESPONSE_BY_EMAIL_URL,
} from 'routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockCivilClaimUnemploymentRetired,
  mockNoStatementOfMeans,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('rejectAllOfClaim', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return rejectAllOfClaim page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_REJECT_ALL_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Why do you believe you don’t owe Mr. Jan Clark any money?');
        });
    });

    it('should return rejectAllOfClaim page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaimUnemploymentRetired;
      const header = 'Why do you believe you don’t owe Mr. Jan Clark any money?';
      await request(app).get(CITIZEN_REJECT_ALL_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(header);
        });
    });

    it('should return rejectAllOfClaim page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const header = 'Why do you believe you don’t owe Mr. Jan Clark any money?';
      await request(app).get(CITIZEN_REJECT_ALL_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(header);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_REJECT_ALL_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return error message when any option is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_REJECT_ALL_CLAIM_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.OPTION_REQUIRED_RESPONSE);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should redirect to claim task list page option DISPUTE is selected', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).post(CITIZEN_REJECT_ALL_CLAIM_URL)
        .send({option: RejectAllOfClaimType.DISPUTE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to claim task list page option ALREADY_PAID is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_REJECT_ALL_CLAIM_URL)
        .send({option: RejectAllOfClaimType.ALREADY_PAID})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to send response by email page option COUNTER_CLAIM is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app).post(CITIZEN_REJECT_ALL_CLAIM_URL)
        .send({option: RejectAllOfClaimType.COUNTER_CLAIM})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(SEND_RESPONSE_BY_EMAIL_URL);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_REJECT_ALL_CLAIM_URL)
        .send({option: RejectAllOfClaimType.ALREADY_PAID})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
