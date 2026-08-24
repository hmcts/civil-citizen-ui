import request from 'supertest';
import * as claimFeeService from 'services/features/claim/amount/claimFeesService';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CLAIM_TOTAL_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {HearingFee} from 'models/caseProgression/hearingFee/hearingFee';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/claimDetailsService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('services/features/claim/amount/claimFeesService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

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
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      jest
        .spyOn(CivilServiceClient.prototype, 'getClaimFeeData')
        .mockResolvedValueOnce({calculatedAmountInPence: 50});
      jest
        .spyOn(CivilServiceClient.prototype, 'getHearingAmount')
        .mockResolvedValueOnce({calculatedAmountInPence: '50'} as HearingFee);
      jest
        .spyOn(CivilServiceClient.prototype, 'calculateClaimInterest')
        .mockResolvedValueOnce(0.02);
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
