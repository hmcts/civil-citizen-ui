import request from 'supertest';
import { app } from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_URL,
} from '../../../../../../../main/routes/urls';
import { VALID_YES_NO_OPTION } from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockCivilClaimUndefined, mockNoStatementOfMeans, mockRedisFailure } from '../../../../../../utils/mockDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Partner', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return citizen partner page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_PARTNER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DO_YOU_LIVE_WITH_PARTNER);
          expect(res.text).toContain(TestMessages.EXAMPLE_LIVE_WITH_PARTNER);
        });
    });
    it('should show partner page when haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CITIZEN_PARTNER_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PARTNER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_DEPENDANTS_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
    });

    it('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_PARTNER_AGE_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PARTNER_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
