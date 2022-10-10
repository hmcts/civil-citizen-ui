import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  InterestClaimOptionsType
} from '../../../../../../main/common/form/models/claim/interest/interestClaimOptionsType';
import {
  getInterestTypeForm,
  saveInterestTypeOption
} from '../../../../../../main/services/features/claim/interest/interestTypeService';
import InterestClaimOption from '../../../../../../main/common/form/models/claim/interest/interestClaimOption';

jest.mock('.../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('Interest Type service', () => {
  describe('get interest type option form ', () => {
    it('should get populated form when data exists', async () => {
      //Given
      const claim = createClaim(InterestClaimOptionsType.SAME_RATE_INTEREST);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getInterestTypeForm('123');
      //Then
      expect(form.interestType).toBe(InterestClaimOptionsType.SAME_RATE_INTEREST);
    });
    it('should get new form when interest type is empty', async () => {
      //Given
      const claim = createClaim(undefined);
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getInterestTypeForm('123');
      //Then
      expect(form.interestType).toBeUndefined();
    });
    it('should get new form when interest type option undefined', async () => {
      //Given
      const claim = new Claim();
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const form = await getInterestTypeForm('123');
      //Then
      expect(form.interestType).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getInterestTypeForm('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('save interest type option', () => {
    it('should save interest type option successfully with existing claim', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveInterestTypeOption('123', new InterestClaimOption(InterestClaimOptionsType.BREAK_DOWN_INTEREST));
      //Then
      expect(spy).toBeCalled();
    });
  });
});

function createClaim(interestClaimOptions: InterestClaimOptionsType) {
  const claim = new Claim();
  claim.interestClaimOptions = interestClaimOptions;
  return claim;
}

