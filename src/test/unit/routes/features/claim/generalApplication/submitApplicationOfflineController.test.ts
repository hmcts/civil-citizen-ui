import {app} from '../../../../../../main/app';
import request from 'supertest';
import {GA_SUBMIT_OFFLINE} from 'routes/urls';
import {t} from 'i18next';
import config from 'config';
import nock from 'nock';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('General Application - Application costs', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return page', async () => {
      await request(app)
        .get(GA_SUBMIT_OFFLINE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.SUBMIT_APPLICATION_OFFLINE.TITLE'));
          expect(res.text).toContain(t('N244 form'));
        });
    });
  });
});
