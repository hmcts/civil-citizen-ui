import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

import {getInterest, saveInterest} from '../../../../../../main/services/features/claim/interest/interestService';
import {Interest} from '../../../../../../main/common/form/models/interest/interest';
import {InterestStartDate} from '../../../../../../main/common/form/models/interest/interestStartDate';
import {TotalInterest} from '../../../../../../main/common/form/models/interest/totalInterest';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

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
      expect(spySave).toHaveBeenCalledWith('validClaimId', {interest});
    });

    it('should save total interest', async () => {
      const interest = new Interest();
      interest.totalInterest = new TotalInterest('23', 'this is my reason');
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveInterest('claimId', interest.totalInterest, 'totalInterest');
      expect(spySave).toHaveBeenCalledWith('claimId', {interest});
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
      expect(spySave).toHaveBeenCalledWith('validClaimId', {interest});
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
