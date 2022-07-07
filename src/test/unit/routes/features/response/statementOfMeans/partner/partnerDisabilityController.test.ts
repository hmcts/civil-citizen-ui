import request from 'supertest';
import { app } from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../../../../main/routes/urls';
import { VALID_YES_NO_OPTION } from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockCivilClaimUndefined, mockNoStatementOfMeans, mockRedisFailure } from '../../../../../../utils/mockDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    test('should return citizen disability partner page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_PARTNER_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.IS_YOUR_PARTNER_DISABLED);
        });
    });
    test('should show partner page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CITIZEN_PARTNER_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PARTNER_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    test('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    test('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    test('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });
    test('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_SEVERE_DISABILITY_URL);
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PARTNER_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
