import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from 'models/partialAdmission';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
describe('why do you disagree service', () => {
  describe('get text form', () => {
    it('should get text form when data exists Partial Admission', async () => {
      //Given
      const claim = createClaim('Test');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.whyDoYouDisagree.text).toBe('Test');
    });
    it('should get new form when text is empty Partial Admission', async () => {
      //Given
      const claim = createClaim('');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.whyDoYouDisagree.text).toMatch('');
    });
    it('should get new form when text undefined Partial Admission', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123', ResponseType.PART_ADMISSION);
      //Then
      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });
    it('should get new form when text is empty Full Rejection', async () => {
      //Given
      const claim = createClaim('');
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123', ResponseType.FULL_DEFENCE);
      //Then
      expect(form.whyDoYouDisagree.text).toBeUndefined();
    });
    it('should get text form when data exists Full Rejection', async () => {
      //Given
      const claim = createClaimFullRejection('Test');
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getWhyDoYouDisagreeForm('123', ResponseType.FULL_DEFENCE);
      //Then
      expect(form.whyDoYouDisagree.text).toBe('Test');
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getWhyDoYouDisagreeForm('123', ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save text', () => {
    it('should save text successfully with existing claim Partial admission', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should save text successfully with no claim in draft store Partial admission', async () => {
      //Given
      const claim = createPartialAdmission();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should get new form when Partial Admission does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'), ResponseType.PART_ADMISSION);
      //Then
      expect(spy).toBeCalled();
    });
    it('should save text successfully with existing claim Full Rejection', async () => {
      //Given
      const claim = createFullRejection();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'), ResponseType.FULL_DEFENCE);
      //Then
      expect(spy).toBeCalled();
    });
    it('should get new form when Full Rejection does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree('Test'), ResponseType.FULL_DEFENCE);
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
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveWhyDoYouDisagreeData('123', new WhyDoYouDisagree(), ResponseType.PART_ADMISSION)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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

function createClaimFullRejection(text: string) {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  claim.rejectAllOfClaim.whyDoYouDisagree = new WhyDoYouDisagree(text);

  return claim;
}

function createFullRejection() {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  return claim;
}
