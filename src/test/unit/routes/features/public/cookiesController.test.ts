import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  COOKIES_URL,
} from 'routes/urls';
import {defaultCookiePreferences} from 'routes/features/public/cookiesController';
import {t} from 'i18next';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Cookies page', () => {
  // TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should display cookies page', async () => {
      const res = await request(app).get(COOKIES_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.COOKIES.TITLE'));
    });

    describe('on POST', () => {
      it('saved cookie preferences', async () => {
        const res = await request(app).post(COOKIES_URL).send(defaultCookiePreferences);
        expect(res.status).toBe(200);
        expect(res.text).toContain('Success');
      });
    });
  });
});
