import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_TIMELINE_URL, CLAIM_REASON_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {
  getClaimDetails,
  saveClaimDetails,
} from 'services/features/claim/details/claimDetailsService';
import {Claim} from 'models/claim';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/claim/details/claimDetailsService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const mockClaimDetails = getClaimDetails as jest.Mock;
const mockSaveClaimDetails = saveClaimDetails as jest.Mock;

const createMockManagerResult = (claim: Claim): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: '123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Claim Details - Reason', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return reason page empty when dont have information on redis ', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockClaimDetails.mockResolvedValue(mockClaim);

      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.REASON_EXPLANATION);
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_REASON_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return errors on no input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockClaimDetails.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: ''})
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.REASON_REQUIRED').replace(/'/g, '&#39;'));
        });
    });

    it('should accept a valid input', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to timeline page', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);
      mockUpdateDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockSaveDraftClaim.mockResolvedValue(undefined);
      mockSaveClaimDetails.mockResolvedValue(undefined);

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_TIMELINE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      mockSaveClaimDetails.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_REASON_URL)
        .send({text: 'reason'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
