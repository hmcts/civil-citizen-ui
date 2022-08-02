import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getDeterminationWithoutHearing,
  saveDeterminationWithoutHearing,
} from '../../../../../main/services/features/directionsQuestionnaire/determinationWithoutHearingService';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  DeterminationWithoutHearing,
} from '../../../../../main/common/models/directionsQuestionnaire/determinationWithoutHearing';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Determination Without Hearing Service', () => {
  describe('getDeterminationWithoutHearing', () => {
    it('should return undefined if vulnerability is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const determinationWithoutHearing = await getDeterminationWithoutHearing('validClaimId');

      expect(determinationWithoutHearing.isDeterminationWithoutHearing).toBeUndefined();
      expect(determinationWithoutHearing.reasonForHearing).toBeUndefined();
    });

    it('should return determinationWithoutHearing object with isDeterminationWithoutHearing no', async () => {
      const claim = new Claim();
      claim.determinationWithoutHearing = {
        isDeterminationWithoutHearing: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const determinationWithoutHearing = await getDeterminationWithoutHearing('validClaimId');

      expect(determinationWithoutHearing.isDeterminationWithoutHearing).toBe(YesNo.NO);
      expect(determinationWithoutHearing.reasonForHearing).toBeUndefined();
    });

    it('should return determinationWithoutHearing object with isDeterminationWithoutHearing yes and reasonForHearing', async () => {
      const claim = new Claim();
      claim.determinationWithoutHearing = {
        isDeterminationWithoutHearing: YesNo.NO,
        reasonForHearing: '99 reasons',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const determinationWithoutHearing = await getDeterminationWithoutHearing('validClaimId');

      expect(determinationWithoutHearing.isDeterminationWithoutHearing).toBe(YesNo.NO);
      expect(determinationWithoutHearing.reasonForHearing).toBe('99 reasons');
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getDeterminationWithoutHearing('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDeterminationWithoutHearing', () => {
    const determinationWithoutHearing: DeterminationWithoutHearing = {
      isDeterminationWithoutHearing: YesNo.YES,
    };

    it('should save determination without hearing successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveDeterminationWithoutHearing('validClaimId', determinationWithoutHearing);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {determinationWithoutHearing});
    });

    it('should update claim determination successfully', async () => {
      const claim = new Claim();
      claim.determinationWithoutHearing = determinationWithoutHearing;
      const updatedDetermination: DeterminationWithoutHearing = {
        isDeterminationWithoutHearing: YesNo.NO,
        reasonForHearing: 'my reason',
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveDeterminationWithoutHearing('validClaimId', updatedDetermination);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {determinationWithoutHearing: updatedDetermination});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveDeterminationWithoutHearing('claimId', {isDeterminationWithoutHearing: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
