import request from 'supertest';
import { app } from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import { CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL } from '../../../../../../main/routes/urls';
import { TestMessages } from '../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockCivilClaimOptionNo, mockRedisFailure } from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('SevereDisability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return citizen severe disability page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_SEVERELY_DISABLED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ARE_YOU_SEVERELY_DISABLED);
        });
    });
    it('should show disability page when haven´t statementOfMeans', async () => {

      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .get(CITIZEN_SEVERELY_DISABLED_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_SEVERELY_DISABLED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when "no" and haven´t statementOfMeans', async () => {
      app.locals.draftStoreClient = mockCivilClaimOptionNo;
      await request(app)
        .post(CITIZEN_SEVERELY_DISABLED_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    it('should redirect page when "no"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_SEVERELY_DISABLED_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    it('should return error on incorrect input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_SEVERELY_DISABLED_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });
    it('should redirect page when "yes"', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_SEVERELY_DISABLED_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_SEVERELY_DISABLED_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
