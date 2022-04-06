import { app } from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import { CITIZEN_WHO_EMPLOYS_YOU_URL } from '../../../../../../../main/routes/urls';
import { TestMessages } from '../../../../../../utils/errorMessageTestConstants';
import { mockCivilClaim, mockRedisFailure } from '../../../../../../utils/mockDraftStore';
import { VALID_ENTER_AT_LEAST_ONE_EMPLOYER, VALID_ENTER_AN_EMPLOYER_NAME, VALID_ENTER_A_JOB_TITLE } from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Who employs you', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
  describe('on Get', () => {
    it('should return who employs you page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Who employs you?');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
  describe('on Post', () => {
    it('should return error message when form is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: '', jobTitle: '' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AT_LEAST_ONE_EMPLOYER);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when employerName is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: '', jobTitle: 'Test' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AN_EMPLOYER_NAME);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when jobTitle is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: 'Test', jobTitle: '' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_A_JOB_TITLE);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    // it('should return error message when option yes is selected but no employment type is selected', async () => {
    //   await request(app).post(CITIZEN_EMPLOYMENT_URL)
    //     .send('option=yes')
    //     .expect((res) => {
    //       expect(res.status).toBe(200);
    //       expect(res.text).toContain(VALID_AT_LEAST_ONE_OPTION);
    //     });
    // });
    // it('should redirect to employers page when option is yes and employment type is self-employed', async () => {
    //   await request(app).post(CITIZEN_EMPLOYMENT_URL)
    //     .send({option: 'yes', employmentCategory: 'SELF-EMPLOYED'})
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toEqual(SELF_EMPLOYED_URL);
    //     });
    // });
    // it('should redirect to employers page when option is yes and employment type is employed', async () => {
    //   await request(app).post(CITIZEN_EMPLOYMENT_URL)
    //     .send({option: 'yes', employmentCategory: 'EMPLOYED'})
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
    //     });
    // });
    // it('should redirect to employers page when option is yes and employment type is self-employed and employed', async () => {
    //   await request(app).post(CITIZEN_EMPLOYMENT_URL)
    //     .send({option: 'yes', employmentCategory: ['EMPLOYED', 'SELF-EMPLOYED']})
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
    //     });
    // });
    // it('should redirect to unemployed page when option is no', async () => {
    //   await request(app).post(CITIZEN_EMPLOYMENT_URL)
    //     .send('option=no')
    //     .expect((res) => {
    //       expect(res.status).toBe(302);
    //       expect(res.header.location).toEqual(UNEMPLOYED_URL);
    //     });
    // });
  });
});
