import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL, TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');

describe('Telephone Mediation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return telephone mediation page successfully when applicant is business', async () => {
      await request(app).get(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('telephone mediation');
      });
    });

  });

  describe('on POST - claimant response', () => {
    it('should redirect to task-list page when the user hit into continue button', async () => {
      await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CLAIMANT_RESPONSE_TASK_LIST_URL);
      });
    });

    it('should return status 500 when there is Redis error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

  });

  describe('on POST - defendant response', () => {
    beforeAll(() => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('123456789');
    });

    it('should redirect to task-list page when the user hit into continue button', async () => {
      await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
      });
    });

    it('should return status 500 when there is Redis error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).post(TELEPHONE_MEDIATION_URL).expect(res => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });

  });
});

