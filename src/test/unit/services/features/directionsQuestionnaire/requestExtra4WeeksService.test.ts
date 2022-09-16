import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {
  getRequestExtra4weeks,
  saveRequestExtra4weeks,
} from '../../../../../main/services/features/directionsQuestionnaire/requestExtra4WeeksService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from '../../../../../main/common/form/models/genericYesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Request extra 4 weeks to settle the Claim Service', () => {
  describe('getRequestExtra4weeks', () => {
    it('should return request extra 4 weeks object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const requestExtra4Weeks = await getRequestExtra4weeks('validClaimId');

      expect(requestExtra4Weeks.option).toBeUndefined();
    });

    it('should return request extra 4 weeks option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.requestExtra4weeks = {option: YesNo.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const requestExtra4Weeks = await getRequestExtra4weeks('validClaimId');

      expect(requestExtra4Weeks.option).toBe(YesNo.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getRequestExtra4weeks('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveRequestExtra4weeks', () => {
    const requestExtra4weeks: GenericYesNo = {
      option: YesNo.YES,
    };

    it('should save request extra 4 weeks successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveRequestExtra4weeks('validClaimId', requestExtra4weeks);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {requestExtra4weeks}});
    });

    it('should update request extra 4 weeks successfully', async () => {
      const updatedRequestExtra4Weeks: GenericYesNo = {
        option: YesNo.NO,
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.requestExtra4weeks = updatedRequestExtra4Weeks;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.requestExtra4weeks = requestExtra4weeks;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveRequestExtra4weeks('validClaimId', updatedRequestExtra4Weeks);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveRequestExtra4weeks('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
