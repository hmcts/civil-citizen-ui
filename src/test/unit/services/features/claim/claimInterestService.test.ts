import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {getClaimInterest, saveClaimInterest} from '../../../../../main/services/features/claim/claimInterestService';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {Claim} from '../../../../../main/common/models/claim';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const CASE_ID = '123';
const claim = new Claim()

describe('Claim interest service', () => {
  describe('get Claim interest', () => {
    it('should return an empty GenericYesNo when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return new GenericYesNo();
      });

      //When
      const result = await getClaimInterest(CASE_ID)

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new GenericYesNo());
    });

    it('should return a claimInterest object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        claim.claimInterest = new GenericYesNo(YesNo.YES)
        return claim;
      });

      //When
      const result = await getClaimInterest(CASE_ID)

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result.option).not.toBeNull();
      expect(result.option).toEqual(YesNo.YES);
    });

    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getClaimInterest(CASE_ID)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save Claim interest', async () => {
    it('should save claim Interest option when option is YES', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.claimInterest = {option : YesNo.YES}
        return claim
      });

      //When
      await saveClaimInterest(CASE_ID, new GenericYesNo(YesNo.YES))

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claim);
    });

    it('should save claim Interest option when option is NO', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.claimInterest = {option : YesNo.NO}
        return claim
      });

      //When
      await saveClaimInterest(CASE_ID, new GenericYesNo(YesNo.NO))

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claim);
    });

    it('should throw error when draft store get method throws error', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveClaimInterest(CASE_ID, new GenericYesNo(YesNo.YES))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when draft store save method throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveClaimInterest(CASE_ID, new GenericYesNo(YesNo.YES))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
