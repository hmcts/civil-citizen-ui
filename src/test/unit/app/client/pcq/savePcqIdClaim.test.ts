import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Save PCQ ID Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockRequest = { params: { id: '12345' } } as unknown as AppRequest;

  it('should save PCQ id', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await savePcqIdClaim('pcqId', mockRequest,'claimId');
    //Then
    expect(spySave).toBeCalled();
  });

  it('should throw error when error occurs on save PCQ id', async () => {
    //Given
    const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
    mockSaveDraftClaim.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(savePcqIdClaim('pcqId', mockRequest,'claimId')).rejects.toThrow(
      TestMessages.REDIS_FAILURE,
    );
  });
});
