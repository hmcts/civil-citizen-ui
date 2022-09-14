import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  getTriedToSettle,
  saveTriedToSettle,
} from '../../../../../main/services/features/directionsQuestionnaire/triedToSettleService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {TriedToSettle} from '../../../../../main/common/models/directionsQuestionnaire/triedToSettle';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Tried to Settle the Claim Service', () => {
  describe('getTriedToSettle', () => {
    it('should return tried to settle object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const triedToSettle = await getTriedToSettle('validClaimId');

      expect(triedToSettle.option).toBeUndefined();
    });

    it('should return tried to settle option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.triedToSettle = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const triedToSettle = await getTriedToSettle('validClaimId');

      expect(triedToSettle.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getTriedToSettle('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveTriedToSettle', () => {
    const triedToSettle: TriedToSettle = {
      option: YesNo.YES,
    };

    it('should save tried to settle successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveTriedToSettle('validClaimId', triedToSettle);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {triedToSettle}});
    });

    it('should update tried to settle successfully', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.triedToSettle = triedToSettle;
      const updatedTriedToSettle: TriedToSettle = {
        option: YesNo.NO,
      };
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveTriedToSettle('validClaimId', updatedTriedToSettle);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {triedToSettle: updatedTriedToSettle}});
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveTriedToSettle('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
