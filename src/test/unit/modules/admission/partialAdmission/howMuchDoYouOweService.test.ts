import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from '../../../../../main/modules/admission/partialAdmission/howMuchDoYouOweService';
import { Claim } from '../../../../../main/common/models/claim';
import { PartialAdmission } from '../../../../../main/common/models/PartialAdmission';
import { HowMuchDoYouOwe } from '../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import { TestMessages } from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const AMOUNT = 12.9;
const TOTAL_AMOUNT = 110;
describe('How much money do you admit you owe? Service ', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getHowMuchDoYouOweForm', () => {
    it('should get empty form when partial Admission does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getHowMuchDoYouOweForm('129');
      //Then
      expect(form.amount).toBe(null);
      expect(form.totalAmount).toBeUndefined();
    });
    it('should return an empty form when howMuchDoYouOwe does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.partialAdmission = new PartialAdmission();
        return claim;
      });
      //When
      const form = await getHowMuchDoYouOweForm('129');
      //Then
      expect(form.amount).toBe(null);
      expect(form.totalAmount).toBeUndefined();
    });
    it('should return populated form when howMuchDoYouOwe exists', async () => {

      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.totalClaimAmount = TOTAL_AMOUNT;
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(AMOUNT);
        return claim;
      });
      //When
      const form = await getHowMuchDoYouOweForm('123');
      //Then
      expect(form.amount).toBeTruthy();
      expect(form.amount).toBe(AMOUNT);
      expect(form.totalAmount).toBe(TOTAL_AMOUNT);
    });
    it('should throw error when error is thrown from redis', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getHowMuchDoYouOweForm('129')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('saveHowMuchDoYouOweData', () => {
    it('should save data successfully when claim exists but no partial admissions', async () => {
    //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveHowMuchDoYouOweData('129', new HowMuchDoYouOwe(AMOUNT, TOTAL_AMOUNT));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw an error when redis throws an error', async () => {
    //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveHowMuchDoYouOweData('129', new HowMuchDoYouOwe(AMOUNT, TOTAL_AMOUNT))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

  });
});