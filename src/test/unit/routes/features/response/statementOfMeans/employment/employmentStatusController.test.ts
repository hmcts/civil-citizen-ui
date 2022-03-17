import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_EMPLOYMENT_URL} from '../../../../../../../main/routes/urls';
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
    });
    it('should return error message when option yes is selected but no employment type is selected', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AT_LEAST_ONE_OPTION);
        });
    });
  });
});
