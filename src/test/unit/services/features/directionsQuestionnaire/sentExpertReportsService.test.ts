import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getSentExpertReports,
  saveSentExpertReports,
} from '../../../../../main/services/features/directionsQuestionnaire/sentExpertReportsService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {SentExpertReports} from '../../../../../main/common/models/directionsQuestionnaire/sentExpertReports';
import {YesNoNotReceived} from '../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Sent Expert Reports Service', () => {
  describe('getExpertReports', () => {
    it('should return sent expert reports object with undefined option', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const expertReports = await getSentExpertReports('validClaimId');

      expect(expertReports.option).toBeUndefined();
    });

    it('should return sent expert reports option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.sentExpertReports = {option: YesNoNotReceived.YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertReports = await getSentExpertReports('validClaimId');

      expect(expertReports.option).toBe(YesNoNotReceived.YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getSentExpertReports('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveExpertReports', () => {
    const sentExpertReports: SentExpertReports = {
      option: YesNoNotReceived.YES,
    };

    it('should save sent expert reports successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveSentExpertReports('validClaimId', sentExpertReports);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {sentExpertReports}});
    });

    it('should update sent expert reports successfully', async () => {
      const updatedExpertReports: SentExpertReports = {
        option: YesNoNotReceived.NO,
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.sentExpertReports = updatedExpertReports;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.sentExpertReports = updatedExpertReports;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveSentExpertReports('validClaimId', updatedExpertReports);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveSentExpertReports('claimId', {option: YesNoNotReceived.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
