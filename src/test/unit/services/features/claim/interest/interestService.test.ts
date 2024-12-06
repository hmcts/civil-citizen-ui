import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

import {getInterest, saveInterest} from '../../../../../../main/services/features/claim/interest/interestService';
import {Interest} from '../../../../../../main/common/form/models/interest/interest';
import {InterestStartDate} from '../../../../../../main/common/form/models/interest/interestStartDate';
import {
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestSelection,
  SameRateInterestType,
} from '../../../../../../main/common/form/models/claimDetails';
import {TotalInterest} from '../../../../../../main/common/form/models/interest/totalInterest';
import {InterestClaimOptionsType} from '../../../../../../main/common/form/models/claim/interest/interestClaimOptionsType';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const mockSameRateInterestSelectionWithValues: SameRateInterestSelection = {
  sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
  differentRate: 40,
  reason: 'Reasons here...',
};

describe('Interest Service', () => {
  describe('getInterest', () => {
    it('should return undefined if interest is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const interest = await getInterest('validClaimId');
      expect(interest?.interestStartDate).toBeUndefined();
    });

    it('should return Interest object with interest start date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestStartDate = {
        day: 2,
        month: 2,
        year: 2022,
        reason: 'test',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const interest = await getInterest('validClaimId');

      expect(interest?.interestStartDate?.day).toBe(2);
      expect(interest?.interestStartDate?.month).toBe(2);
      expect(interest?.interestStartDate?.year).toBe(2022);
      expect(interest?.interestStartDate?.reason).toBe('test');
    });

    it('should return Interest object with interest end date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const interest = await getInterest('validClaimId');

      expect(interest?.interestEndDate).toBe(InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE);
    });

    it('should return Interest object with interest claim form', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const interest = await getInterest('validClaimId');

      expect(interest?.interestClaimFrom).toBe(InterestClaimFromType.FROM_A_SPECIFIC_DATE);
    });

    it('should return Interest object with interest claim options', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const interest = await getInterest('validClaimId');

      expect(interest?.interestClaimOptions).toBe(InterestClaimOptionsType.BREAK_DOWN_INTEREST);
    });

    it('should return Interest object with same rate interest selection', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const interest = await getInterest('validClaimId');

      expect(interest?.sameRateInterestSelection).toBe(mockSameRateInterestSelectionWithValues);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getInterest('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveInterest', () => {
    const interest = new Interest();
    interest.interestStartDate = new InterestStartDate('1', '1', '2021', 'test');

    it('should save interest successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        return claim;
      });
      interest.interestStartDate = new InterestStartDate('1', '1', '2021', 'test');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestStartDate, 'interestStartDate');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should save total interest', async () => {
      const interest = new Interest();
      interest.totalInterest = new TotalInterest('23', 'this is my reason');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('claimId', interest.totalInterest, 'totalInterest');
      expect(spySave).toHaveBeenCalledWith('claimId', {refreshDataForDJ: true, interest});
    });

    it('should update interest start date successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        return claim;
      });
      interest.interestStartDate = new InterestStartDate('3', '3', '2021', 'updatedTest');

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestStartDate, 'interestStartDate');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should update interest end date successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        return claim;
      });
      interest.interestStartDate = undefined;
      interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestEndDate, 'interestEndDate');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should update interest claim from successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        return claim;
      });
      interest.interestStartDate = undefined;
      interest.interestEndDate = undefined;
      interest.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestClaimFrom, 'interestClaimFrom');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should update interest claim options successfully with SAME_RATE_INTEREST', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
        return claim;
      });
      interest.interestStartDate = undefined;
      interest.interestEndDate = undefined;
      interest.interestClaimFrom = undefined;
      interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestClaimOptions, 'interestClaimOptions');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should update interest claim options successfully with BREAK_DOWN_INTEREST', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
        return claim;
      });
      interest.interestStartDate = undefined;
      interest.interestEndDate = undefined;
      interest.interestClaimFrom = undefined;
      interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.interestClaimOptions, 'interestClaimOptions');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should update same rate interest selection successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.interest = new Interest();
        return claim;
      });
      interest.interestStartDate = undefined;
      interest.interestEndDate = undefined;
      interest.interestClaimFrom = undefined;
      interest.interestClaimOptions = undefined;
      interest.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('validClaimId', interest?.sameRateInterestSelection, 'sameRateInterestSelection');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {refreshDataForDJ: true, interest});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveInterest('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
