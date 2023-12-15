import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CCJ_REPAYMENT_PLAN_DEFENDANT_URL} from 'routes/urls';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('CCJ - repayment plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return repayment plan page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_REPAYMENT_PLAN_DEFENDANT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.REPAYMENT_PLAN_SUMMARY.CLAIMANTS_REPAYMENT_PLAN'));    });

  });
});
