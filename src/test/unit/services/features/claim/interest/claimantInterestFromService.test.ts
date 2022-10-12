import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {getClaimantInterestFrom, saveClaimantInterestFrom} from '../../../../../../main/services/features/claim/interest/claimantInterestFromService';
import {Claim} from '../../../../../../main/common/models/claim';
import {InterestClaimFromType} from '../../../../../../main/common/form/models/claimDetails';
import {InterestClaimFromSelection} from '../../../../../../main/common/form/models/claim/interest/interestClaimFromSelection';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const CASE_ID = '123';
const claim = new Claim();

describe('Claimant Interest From service', () => {
  describe('get Claimant interest from selection', () => {
    it('should return an empty selection object when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        return new InterestClaimFromSelection();
      });

      //When
      const result = await getClaimantInterestFrom(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(new InterestClaimFromSelection());
    });

    it('should return a selection object with value when data is retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
        return claim;
      });

      //When
      const result = await getClaimantInterestFrom(CASE_ID);

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result.option).not.toBeNull();
      expect(result.option).toEqual(InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE);
    });

    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getClaimantInterestFrom(CASE_ID)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save Claimant interest from selection', () => {
    it('should save claimant interest from selection when option is The date you submit the claim', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
        return claim;
      });

      //When
      await saveClaimantInterestFrom(CASE_ID, new InterestClaimFromSelection(InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE));

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CASE_ID, claim);
    });

    it('should save claimant interest from selection when option is A particular date', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
        return claim;
      });

      //When
      await saveClaimantInterestFrom(CASE_ID, new InterestClaimFromSelection(InterestClaimFromType.FROM_A_SPECIFIC_DATE));

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
      await expect(saveClaimantInterestFrom(CASE_ID, new InterestClaimFromSelection(InterestClaimFromType.FROM_A_SPECIFIC_DATE)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw error when draft store save method throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveClaimantInterestFrom(CASE_ID, new InterestClaimFromSelection(InterestClaimFromType.FROM_A_SPECIFIC_DATE)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
