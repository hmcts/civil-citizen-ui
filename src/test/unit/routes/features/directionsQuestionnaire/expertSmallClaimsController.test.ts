import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DQ_EXPERT_SMALL_CLAIMS_URL,
} from '../../../../../main/routes/urls';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');

describe('Using an expert', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return Using and expert page', async () => {
      await request(app)
        .get(DQ_EXPERT_SMALL_CLAIMS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.EXPERT_SMALL_CLAIMS.TITLE'));
        });
    });
  });

});
