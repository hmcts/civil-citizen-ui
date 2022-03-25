import request from 'supertest';
import { app } from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DISABILITY_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
} from '../../../../../../main/routes/urls';
import { VALID_YES_NO_OPTION } from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { REDIS_FAILURE } from '../../../../../utils/testConstants';
import { mockCivilClaim, mockCivilClaimOptionNo, mockRedisFailure } from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    test('should return citizen disability page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you disabled?');
        });
    });
    test('should show disability page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: REDIS_FAILURE });
        });
    });
  });

  describe('on POST', () => {
    test('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SEVERELY_DISABLED_URL);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('disability=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: REDIS_FAILURE });
        });
    });
  });

});
