import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {getClaimInterest, saveClaimInterest} from '../../../../../main/services/features/claim/claimInterestService';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {Claim} from "../../../../../main/common/models/claim";
import {GenericYesNo} from "../../../../../main/common/form/models/genericYesNo";
import {TestMessages} from "../../../../utils/errorMessageTestConstants";

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const CLAIM_ID = '123';
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
      const result = await getClaimInterest(CLAIM_ID)

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
      const result = await getClaimInterest(CLAIM_ID)

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result.option).not.toBeNull();
      expect(result.option).toEqual(YesNo.YES);
    });
  });

  describe('save Claim interest', async () => {
    it('should return error when getting case data', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');

      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //When
      await saveClaimInterest(CLAIM_ID, new GenericYesNo(YesNo.YES))

      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).rejects.toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    it('should return error when saving draft claim', async () => {
      //Given
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //When
      await saveClaimInterest(CLAIM_ID, new GenericYesNo(YesNo.YES))

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).rejects.toContain(TestMessages.SOMETHING_WENT_WRONG);
    });

    it('should save claim Interest option', async () => {
      //Give
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');

      mockGetCaseData.mockImplementation(async () => {
        claim.claimInterest = new GenericYesNo(YesNo.YES)
        return claim
      });

      //When
      await saveClaimInterest(CLAIM_ID, new GenericYesNo(YesNo.YES))

      //Then
      expect(spySaveDraftClaim).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, claim);
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).toBeCalled();
      await expect(saveClaimInterest('123', new GenericYesNo('yes'))).not.toThrowError();
    });
  });
});
