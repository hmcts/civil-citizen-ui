import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION,
} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');

const CONTROLLER_URL = MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION;
describe('Mediation Confirmation Upload Documents Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return Start Mediation Upload Documents page', async () => {
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.MEDIATION.CONFIRMATION_PAGE.PAGE_TITLE'));
        });
    });
  });
});
