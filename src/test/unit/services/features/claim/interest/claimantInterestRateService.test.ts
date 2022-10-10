import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {getInterestRate,saveIterestRate,getInterestRateForm} from '../../../../../../main/services/features/claim/interest/claimantInterestRateService';
import {Claim} from '../../../../../../main/common/models/claim';
import {SameRateInterestSelection, SameRateInterestType} from '../../../../../../main/common/form/models/claimDetails';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ClaimantInterestRate} from '../../../../../../main/common/form/models/claim/interest/claimantInterestRate';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockSameRateInterestSelection: SameRateInterestSelection = {
  sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
  differentRate: undefined,
  reason: '',
};

const mockSameRateInterestSelectionWithValues: SameRateInterestSelection = {
  sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
  differentRate: 40,
  reason: 'Reasons here...',
};

describe('Claimant Interest Rate Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getInterestRate', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getInterestRate('123');
      //Then
      expect(form.option).toBeUndefined();
      expect(form.rate).toBeUndefined();
      expect(form.reason).toBeUndefined();
      expect(form.option).toEqual(undefined);
      expect(form.rate).toEqual(undefined);
      expect(form.reason).toEqual(undefined);
    });
  });

  it('should get empty form when claimant iterest rate does not exist', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.sameRateInterestSelection = mockSameRateInterestSelection;
      return claim;
    });
    //When
    const form = await getInterestRate('123');
    //Then
    expect(form.option).toEqual(SameRateInterestType.SAME_RATE_INTEREST_8_PC);
    expect(form.rate).toEqual(undefined);
    expect(form.reason).toEqual('');
  });

  it('should return populated form when claimant interest rate exists', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;
      return claim;
    });
    //When
    const form = await getInterestRate('123');

    //Then
    expect(form.option).toEqual(SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE);
    expect(form.rate).toEqual(40);
    expect(form.reason).toEqual('Reasons here...');
  });

  it('should rethrow error when error occurs', async () => {
    //When
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(getInterestRate('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });

  describe('saveIterestRate', () => {
    it('should save claimant interest rate not defined when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.sameRateInterestSelection = undefined;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveIterestRate('123', new ClaimantInterestRate(undefined,undefined,''));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save claimant interest rate data successfully when claim exists  and different rate provided', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await getInterestRateForm(SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE, 40, 'Reason...');
      await saveIterestRate('123', new ClaimantInterestRate(
        mockSameRateInterestSelection.sameRateInterestType,
        mockSameRateInterestSelection.differentRate,
        mockSameRateInterestSelection.reason));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save claimant interest rate not defined when claim exists and 8% rate selected', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await getInterestRateForm(SameRateInterestType.SAME_RATE_INTEREST_8_PC, undefined, '');
      await saveIterestRate('123', new ClaimantInterestRate(SameRateInterestType.SAME_RATE_INTEREST_8_PC,undefined,''));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //Given
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveIterestRate('123', new ClaimantInterestRate(
        mockSameRateInterestSelectionWithValues.sameRateInterestType,
        mockSameRateInterestSelectionWithValues.differentRate,
        mockSameRateInterestSelectionWithValues.reason,
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveIterestRate('123', new ClaimantInterestRate(
        mockSameRateInterestSelectionWithValues.sameRateInterestType,
        mockSameRateInterestSelectionWithValues.differentRate,
        mockSameRateInterestSelectionWithValues.reason,
      ))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
