import request from 'supertest';
import nock from 'nock';
import config from 'config';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, GA_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {app} from '../../../../../../../main/app';
import {t} from 'i18next';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import { getClaimById } from 'modules/utilityService';
import { Claim } from 'common/models/claim';
import { CaseRole } from 'common/form/models/caseRoles';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('GA response submission confirmation controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return ga submit confirmation page as a claimant', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      const res = await request(app).get(GA_RESPONSE_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONSE_CONFIRMATION.JUDGE_WILL_CONSIDER'));
      expect(res.text).toContain(DASHBOARD_CLAIMANT_URL);
    });
    it('should return ga submit confirmation page as a defendant', async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
      const res = await request(app).get(GA_RESPONSE_CONFIRMATION_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.RESPONSE_CONFIRMATION.JUDGE_WILL_CONSIDER'));
      expect(res.text).toContain(DEFENDANT_SUMMARY_URL);
    });
  });
});
