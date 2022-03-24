import request from 'supertest';
import { app } from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from '../../../../../../../main/routes/urls';
import { VALID_YES_NO_OPTION, REDIS_FAILURE } from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { mockCivilClaim, mockNoStatementOfMeans, mockCivilClaimOptionNo, mockRedisFailure } from '../../../../../../utils/mockDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner Age', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    test('should return citizen partner age page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Is your partner aged 18 or over?');
        });
    });
    test('should show partner age page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PARTNER_AGE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: REDIS_FAILURE });
        });
    });
  });
  describe('on POST', () => {
    test('should redirect page when "no" and defendant disabled = YES', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('partnerAge=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_DISABILITY_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('partnerAge=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_PENSION_URL);
        });
    });
    test('should redirect page when "no" and defendant disabled = NO', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('partnerAge=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PARTNER_AGE_URL)
        .send('partnerAge=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ error: REDIS_FAILURE });
        });
    });
  });
});
