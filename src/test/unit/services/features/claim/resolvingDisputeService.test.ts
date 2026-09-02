import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveResolvingDispute} from 'services/features/claim/resolvingDisputeService';
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

describe('Resolving Dispute Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save claim with resolvingDispute true', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveResolvingDispute(mockReq);

    expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({resolvingDispute: true}),
      'draft-123',
    );
  });

  it('should map createdAt when missing on save', async () => {
    const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveResolvingDispute(mockReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        draftClaimCreatedAt: new Date(createdAtTimestamp),
      }),
      'draft-123',
    );
  });

  it('should use rawResponse draftId when session has none', async () => {
    const reqWithoutDraftId = {session: {user: {id: '123'}}} as unknown as AppRequest;
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
    mockUpdateDraftClaim.mockResolvedValue({});

    await saveResolvingDispute(reqWithoutDraftId);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(saveResolvingDispute(mockReq)).rejects.toThrow(
      '[resolvingDisputeService] no draft claim found to update',
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should throw when the manager fails', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(saveResolvingDispute(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
