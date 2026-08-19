import {CLAIM_CONFIRMATION_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {Claim} from 'models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {YesNo} from 'form/models/yesNo';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/claim/amount/checkClaimFee');
jest.mock('modules/utilityService', () => ({
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const createMockManagerResult = (c: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: c as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: c,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  const claimId = '1111111111';
  const caseData = Object.assign(new Claim(), claim.case_data);

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {

    it('should return claim submitted page and HWF number not submitted : Pay Fee button set with Pay fee Breakup Url', async () => {
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.NO,
      };

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(caseData));
      mockGetCaseDataFromStore.mockResolvedValue(caseData);

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);

      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(claimId);
          expect(res.text).toContain('/claim/'+claimId+'/fee');
        });
    });

    it('should contain help with fees info', async () => {
      caseData.claimDetails.helpWithFees = {
        'option': YesNo.YES,
      };

      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(caseData));
      mockGetCaseDataFromStore.mockResolvedValue(caseData);

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockResolvedValueOnce(caseData);
      const text = 'Your claim will be issued once your Help With Fees application has been confirmed.';

      await request(app)
        .get(CLAIM_CONFIRMATION_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(text);
        });
    });

    it('should return 500 status code when error occurs', async () => {
      const error = new Error('Test error');

      mockGetDraftClaim.mockRejectedValue(error);
      mockGetCaseDataFromStore.mockRejectedValue(error);

      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockRejectedValueOnce(error);

      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
