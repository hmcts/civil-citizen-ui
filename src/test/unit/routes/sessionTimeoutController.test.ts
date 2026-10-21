import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../main/app';
import {SESSION_EXTEND_URL, SESSION_TIMEOUT_URL} from 'routes/urls';
import {t} from 'i18next';

jest.mock('../../../main/modules/oidc');
jest.mock('../../../main/modules/draft-store');

describe('Session timeout', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('GET /session-timeout', () => {
    it('should display the session timeout page without the timeout warning', async () => {
      const res = await request(app).get(SESSION_TIMEOUT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.SESSION_TIMEOUT.TITLE'));
      expect(res.text).toContain(t('PAGES.SESSION_TIMEOUT.DESCRIPTION'));
      expect(res.text).not.toContain('data-module="govuk-timeout-warning"');
    });
  });

  describe('GET /session/extend', () => {
    it('should return 401 when there is no authenticated session', async () => {
      const res = await request(app).get(SESSION_EXTEND_URL);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({extended: false});
    });
  });
});
