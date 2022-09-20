import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';
import {
  getSharedExpertSelection,
  saveSharedExpertSelection,
} from '../../../../../main/services/features/directionsQuestionnaire/sharedExpertService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Shared Expert Service', () => {
  describe('getSharedExpertSelection', () => {
    it('should return shared expert object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const triedToSettle = await getSharedExpertSelection('validClaimId');

      expect(triedToSettle.option).toBeUndefined();
    });

    it('should return shared expert option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.sharedExpert = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const triedToSettle = await getSharedExpertSelection('validClaimId');

      expect(triedToSettle.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getSharedExpertSelection('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveSharedExpertSelection', () => {
    const sharedExpert: GenericYesNo = {
      option: YesNo.YES,
    };

    it('should save shared expert successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveSharedExpertSelection('validClaimId', sharedExpert);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {sharedExpert}});
    });

    it('should update shared expert successfully', async () => {
      const updatedSharedExpert: GenericYesNo = {
        option: YesNo.NO,
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.sharedExpert = updatedSharedExpert;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.sharedExpert = sharedExpert;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveSharedExpertSelection('validClaimId', updatedSharedExpert);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveSharedExpertSelection('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
