import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as draftStoreManagerService from '../../../../../main/modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/draftStoreManagerService');

describe('Resolving Dispute Service', () => {
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

  it('should save claim with completingClaimConfirmed true', async () => {
    //Given
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const spyUpdateDraftClaim = jest.spyOn(draftStoreManagerService, 'updateDraftClaim');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    (draftStoreManagerService.updateDraftClaim as jest.Mock).mockResolvedValue({});
    //When
    await saveCompletingClaim(mockReq);
    // Then
    expect(spyGetCaseDataFromStore).toHaveBeenCalledWith('123');
    expect(spyUpdateDraftClaim).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({completingClaimConfirmed: true}),
      'draft-123',
    );
  });

  it('should throw an error when draftStore fails', async () => {
    //Given
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockRejectedValue(
      new Error(TestMessages.REDIS_FAILURE),
    );
    //Then
    await expect(saveCompletingClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
