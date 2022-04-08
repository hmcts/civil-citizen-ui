import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_UNEMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
} from '../../../../../../../main/routes/urls';
import {
  VALID_AT_LEAST_ONE_OPTION,
  VALID_YES_NO_OPTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Employment status', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    it('should return employment status page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_EMPLOYMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DO_YOU_HAVE_JOB);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_EMPLOYMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
  describe('on Post', () => {
    it('should return error message when no option is selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
          expect(res.text).toContain(TestMessages.GOVUK_ERROR_MESSAGE);
        });
    });
    it('should return error message when option yes is selected but no employment type is selected', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AT_LEAST_ONE_OPTION);
        });
    });
    it('should redirect to employers page when option is yes and employment type is self-employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: 'SELF-EMPLOYED'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SELF_EMPLOYED_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: 'EMPLOYED'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is self-employed and employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: ['EMPLOYED', 'SELF-EMPLOYED']})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to unemployed page when option is no', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_UNEMPLOYED_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_EMPLOYMENT_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
});
