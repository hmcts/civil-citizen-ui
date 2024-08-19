import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {savePcqId, savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('Save PCQ ID Service', () => {
  const mockRequest = { params: { id: '12345' } } as unknown as AppRequest;

  it('should save PCQ id', async () => {
    //Given
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await savePcqIdClaim('pcqId', 'claimId');
    //Then
    expect(spySave).toBeCalled();
  });

  it('should throw error when error occurs on save PCQ id', async () => {
    //Given
    const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
    mockSaveDraftClaim.mockImplementationOnce(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(savePcqIdClaim('pcqId', 'claimId')).rejects.toThrow(
      TestMessages.REDIS_FAILURE,
    );
  });

  it('should save PCQ id', async () => {
    //Given
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await savePcqId('pcqId', mockRequest,'claimId');
    //Then
    expect(spySave).toBeCalled();
  });

  it('should throw error when error occurs on save PCQ id', async () => {
    //Given
    const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
    mockSaveDraftClaim.mockImplementationOnce(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(savePcqId('pcqId', mockRequest,'claimId')).rejects.toThrow(
      TestMessages.REDIS_FAILURE,
    );
  });
});
