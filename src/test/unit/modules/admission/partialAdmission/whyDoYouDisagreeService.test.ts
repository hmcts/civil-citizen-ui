import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from '../../../../../main/modules/admission/partialAdmission/whyDoYouDisagreeService';

import {REDIS_FAILURE} from '../../../../../main/common/form/validationErrors/errorMessageConstants';
import {WhyDoYouDisagree} from '../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from '../../../../../main/common/models/partialAdmission';


jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
describe('why do you disagree service', () => {
  describe('get text form', () => {
    it('should get text form when data exists', async () => {
      //Given
      const claim = createClaim('Test');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123');
      //Then
      expect(form.whyDoYouDisagree.text).toBe('Test');
    });
    it('should get new form when text is empty', async () => {
      //Given
      const claim = createClaim('');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123');
      //Then
      expect(form.whyDoYouDisagree.text).toMatch('');
    });
    it('should get new form when text undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123');
      //Then
      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });
    it('should get new form when data does not exist', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123');
      //Then
      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(getWhyDoYouDisagreeForm('123')).rejects.toThrow(REDIS_FAILURE);
    });
  });
  describe('save text', () => {
    it('should save text successfully with existing claim', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'));
      //Then
      expect(spy).toBeCalled();
    });
    it('should save text successfully with no claim in draft store', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'));
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree())).rejects.toThrow(REDIS_FAILURE);
    });
  });
});

function createClaim(text: string) {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(text);

  return claim;
}

function createPartialAdmission() {
  const claim = new Claim();
  claim.partialAdmission = new PartialAdmission();
  return claim;
}
