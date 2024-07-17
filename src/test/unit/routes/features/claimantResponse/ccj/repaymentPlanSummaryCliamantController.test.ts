import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CCJ_REPAYMENT_PLAN_CLAIMANT_URL} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('CCJ - claimant repayment plan', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return repayment plan page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CCJ_REPAYMENT_PLAN_CLAIMANT_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.REPAYMENT_PLAN_SUMMARY.REPAYMENT_PLAN'));    });

  });
});
