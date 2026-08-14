import * as draftStoreManagerService from '../../../../../main/modules/draft-store/draftStoreManagerService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');

describe('Completing Claim Service', () => {
  const mockReq = {
    session: {
      user: {
        id: '123',
      },
      draftId: 'draft-123',
    },
  } as unknown as AppRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save claim with completingClaimConfirmed true and map draftClaimCreatedAt', async () => {
    //Given
    const mockCreatedAt = '2026-08-14T10:00:00.000Z';
    const spyGetDraftClaim = jest.spyOn(draftStoreManagerService, 'getDraftClaim');
    const spyUpdateDraftClaim = jest.spyOn(draftStoreManagerService, 'updateDraftClaim');

    (draftStoreManagerService.getDraftClaim as jest.Mock).mockResolvedValue({
      claimResponse: {case_data: {}},
      createdAt: mockCreatedAt,
      rawResponse: {draftId: 'draft-123'},
      isNew: false,
    });
    (draftStoreManagerService.updateDraftClaim as jest.Mock).mockResolvedValue({});
    //When
    await saveCompletingClaim(mockReq);
    // Then
    expect(spyGetDraftClaim).toHaveBeenCalledWith(mockReq);
    expect(spyUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        completingClaimConfirmed: true,
        draftClaimCreatedAt: new Date(mockCreatedAt),
      }),
      'draft-123',
    );
  });

  it('should throw an error when draftStoreManager fails', async () => {
    //Given
    (draftStoreManagerService.getDraftClaim as jest.Mock).mockRejectedValue(
      new Error(TestMessages.REDIS_FAILURE),
    );
    //Then
    await expect(saveCompletingClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
