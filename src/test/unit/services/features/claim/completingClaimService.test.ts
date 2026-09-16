import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Resolving Dispute Service', () => {
  const claimId = '123';
  it('should save claim with resolvingDispute true', async () => {
    //Given
    const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    //When
    await saveCompletingClaim(claimId);
    //Then
    expect(spyGetCaseDataFromStore).toBeCalled();
  });
  it('should throw an error', async () => {
    //Given
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(saveCompletingClaim(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
