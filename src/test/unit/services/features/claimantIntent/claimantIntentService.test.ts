import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  getClaimantIntent,
  saveClaimantIntent,
} from '../../../../../main/services/features/claimantIntent/claimantIntentService';
import {ClaimantIntent} from '../../../../../main/common/models/claimantIntent';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Claimant Intent Service', () => {
  describe('getClaimantIntent', () => {
    it('should return undefined if direction claimant intent is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const claimantIntent = await getClaimantIntent('validClaimId');
      expect(claimantIntent?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Intent object', async () => {
      const claim = new Claim();
      claim.claimantIntent = new ClaimantIntent();

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const directionQuestionnaire = await getClaimantIntent('validClaimId');

      expect(directionQuestionnaire?.hasDefendantPaidYou).toBeUndefined();
    });

    it('should return Claimant Intent object with hasDefendantPaidYou no', async () => {
      const claim = new Claim();
      claim.claimantIntent = new ClaimantIntent();
      claim.claimantIntent.hasDefendantPaidYou = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantIntent = await getClaimantIntent('validClaimId');

      expect(claimantIntent?.hasDefendantPaidYou.option).toBe(YesNo.NO);
    });

    it('should return Claimant Intent object with hasDefendantPaidYou yes', async () => {
      const claim = new Claim();
      claim.claimantIntent = new ClaimantIntent();
      claim.claimantIntent.hasDefendantPaidYou = {
        option: YesNo.YES,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const claimantIntent = await getClaimantIntent('validClaimId');

      expect(claimantIntent?.hasDefendantPaidYou.option).toBe(YesNo.YES);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getClaimantIntent('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantIntent', () => {
    const claimantIntent = new ClaimantIntent();
    claimantIntent.hasDefendantPaidYou = new GenericYesNo(YesNo.YES);

    it('should save claimant intent successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantIntent = new ClaimantIntent();
        return claim;
      });

      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claimantIntentToSave = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      await saveClaimantIntent('validClaimId',  YesNo.NO, 'option', 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantIntent: claimantIntentToSave});
    });

    it('should update claim determination successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.claimantIntent = claimantIntent;
        return claim;
      });
      const claimantIntentToUpdate = {
        hasDefendantPaidYou: {option: YesNo.NO},
      };
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveClaimantIntent('validClaimId', claimantIntent?.hasDefendantPaidYou.option, 'hasDefendantPaidYou');
      expect(spySave).toHaveBeenCalledWith('validClaimId', {claimantIntent: claimantIntentToUpdate});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveClaimantIntent('claimId', mockGetCaseDataFromDraftStore, ''))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
