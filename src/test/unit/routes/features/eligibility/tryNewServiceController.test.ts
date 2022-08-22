import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  BASE_ELIGIBILITY_URL,
} from '../../../../../main/routes/urls';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');

describe('Try the new online service', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
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
