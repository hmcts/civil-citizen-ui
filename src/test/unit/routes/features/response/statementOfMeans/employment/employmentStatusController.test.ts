import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_EMPLOYMENT_URL,
  SELF_EMPLOYED_URL,
  UNEMPLOYED_URL,
  WHO_EMPLOYS_YOU_URL,
} from '../../../../../../../main/routes/urls';
import {
  VALID_AT_LEAST_ONE_OPTION,
  VALID_YES_NO_OPTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

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
      await request(app).get(CITIZEN_EMPLOYMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a job?');
        });
    });
  });
  describe('on Post', () => {
    it('should return error message when no option is selected', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_OPTION);
        });
      1;
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
          expect(res.header.location).toEqual(SELF_EMPLOYED_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: 'EMPLOYED'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is self-employed and employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: ['EMPLOYED', 'SELF-EMPLOYED']})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to unemployed page when option is no', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(UNEMPLOYED_URL);
        });
    });
  });
});
