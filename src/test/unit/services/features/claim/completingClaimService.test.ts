import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Completing Claim Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save claim with completingClaimConfirmed true', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveCompletingClaim(mockReq);

    expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({completingClaimConfirmed: true}),
      'draft-123',
    );
  });

  it('should map createdAt when missing on save', async () => {
    const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveCompletingClaim(mockReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        draftClaimCreatedAt: new Date(createdAtTimestamp),
      }),
      'draft-123',
    );
  });

  it('should fall back to rawResponse.draftId if session draftId is missing', async () => {
    const reqWithoutSessionDraftId = {session: {user: {id: '123'}}} as AppRequest;
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveCompletingClaim(reqWithoutSessionDraftId);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      reqWithoutSessionDraftId,
      expect.any(Object),
      'draft-123',
    );
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(saveCompletingClaim(mockReq)).rejects.toThrow(
      '[completingClaimService] no draft claim found to update',
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should throw when the manager fails', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(saveCompletingClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
