import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {saveResolvingDispute} from 'services/features/claim/resolvingDisputeService';

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
    await saveResolvingDispute(claimId);
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
    await expect(saveResolvingDispute(claimId)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
