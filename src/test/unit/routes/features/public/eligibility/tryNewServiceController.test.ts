import request from 'supertest';
import {app} from 'app';
import nock from 'nock';
import config from 'config';
import {BASE_ELIGIBILITY_URL} from 'routes/urls';
import {t} from 'i18next';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Try the new online service', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return Try the new online service page', async () => {
      await request(app)
        .get(BASE_ELIGIBILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.TRY_NEW_SERVICE.TITLE'));
        });
    });
  });

});
