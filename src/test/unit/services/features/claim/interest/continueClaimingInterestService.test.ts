import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {GenericYesNo} from '../../../../../../main/common/form/models/genericYesNo';
import {
  getContinueClaimingInterest, saveContinueClaimingInterest
} from '../../../../../../main/services/features/claim/interest/continueClaimingInterestService';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const CASE_ID = '123';
const claim = new Claim();

describe('Continue Claiming Interest service', () => {
  describe('get Continue Claiming Interest', () => {
    it('should return an empty GenericYesNo when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return new GenericYesNo();
      });

      //When
      const result = await getContinueClaimingInterest(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new GenericYesNo());
    });

    it('should return a continueClaimingInterest object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        claim.continueClaimingInterest = YesNo.YES;
        return claim;
      });

      //When
      const result = await getContinueClaimingInterest(CASE_ID);

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
      await expect(getContinueClaimingInterest(CASE_ID)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save Continue Claiming Interest', () => {
    it('should save continueClaimingInterest option when option is YES', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.continueClaimingInterest = YesNo.YES;
        return claim;
      });

      //When
      await saveContinueClaimingInterest(CASE_ID, YesNo.YES);

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claim);
    });

    it('should save continueClaimingInterest option when option is NO', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.continueClaimingInterest = YesNo.NO;
        return claim;
      });

      //When
      await saveContinueClaimingInterest(CASE_ID, YesNo.NO);

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
      await expect(saveContinueClaimingInterest(CASE_ID, YesNo.YES)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when draft store save method throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveContinueClaimingInterest(CASE_ID, YesNo.YES)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
