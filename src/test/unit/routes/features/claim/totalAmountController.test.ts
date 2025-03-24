import request from 'supertest';
import * as claimFeeService from 'services/features/claim/amount/claimFeesService';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIM_TOTAL_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/claim/amount/claimFeesService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

describe('Total amount', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return total amount page', async () => {
      const spySave = jest.spyOn(claimFeeService, 'saveClaimFee');
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date();
      claim.totalClaimAmount = 1000;
      jest
        .spyOn(CivilServiceClient.prototype, 'getClaimFeeData')
        .mockResolvedValueOnce(Promise.resolve({'calculatedAmountInPence': '50'}) as any);
      jest
        .spyOn(CivilServiceClient.prototype, 'getHearingAmount')
        .mockResolvedValueOnce(Promise.resolve({'calculatedAmountInPence': '50'}) as any);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      const res = await request(app)
        .get(CLAIM_TOTAL_URL.replace(':id', '5129'));

      expect(res.status).toBe(200);
      expect(res.text).toContain('Total amount you’re claiming');
      expect(spySave).toBeCalled();
    });

    it('should return http 500 when has error in the claim amount fee get method', async () => {
      jest
        .spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockRejectedValueOnce(new Error('test error'));
      const res = await request(app)
        .get(CLAIM_TOTAL_URL);

      expect(res.status).toBe(500);
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant individual details if individual radio is selected', async () => {
      const res = await request(app).post(CLAIM_TOTAL_URL);
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(CLAIMANT_TASK_LIST_URL);
    });
  });
});
