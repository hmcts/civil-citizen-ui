import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {savePcqId, savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockRequest = { params: { id: '12345' } } as unknown as AppRequest;
const mockClaimReq = {
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

describe('Save PCQ ID Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save claim PCQ id via the draft manager', async () => {
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
    mockUpdateDraftClaim.mockResolvedValue({});

    await savePcqIdClaim('pcqId', mockClaimReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockClaimReq,
      expect.objectContaining({pcqId: 'pcqId'}),
      'draft-123',
    );
  });

  it('should map createdAt when missing on save', async () => {
    const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
    mockUpdateDraftClaim.mockResolvedValue({});

    await savePcqIdClaim('pcqId', mockClaimReq);

    expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
      mockClaimReq,
      expect.objectContaining({
        pcqId: 'pcqId',
        draftClaimCreatedAt: new Date(createdAtTimestamp),
      }),
      'draft-123',
    );
  });

  it('should throw when no draft exists', async () => {
    mockGetDraftClaim.mockResolvedValue(null);

    await expect(savePcqIdClaim('pcqId', mockClaimReq)).rejects.toThrow(
      '[savePcqIdClaim] no draft claim found',
    );
    expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
  });

  it('should throw error when the manager fails', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(savePcqIdClaim('pcqId', mockClaimReq)).rejects.toThrow(
      TestMessages.REDIS_FAILURE,
    );
  });

  it('should save response PCQ id', async () => {
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

    await savePcqId('pcqId', mockRequest,'claimId');

    expect(spySave).toBeCalled();
  });

  it('should throw error when error occurs on save response PCQ id', async () => {
    const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
    mockSaveDraftClaim.mockImplementationOnce(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });

    await expect(savePcqId('pcqId', mockRequest,'claimId')).rejects.toThrow(
      TestMessages.REDIS_FAILURE,
    );
  });
});
