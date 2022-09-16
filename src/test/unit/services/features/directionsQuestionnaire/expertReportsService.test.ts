import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getExpertReports,
  saveExpertReports,
} from '../../../../../main/services/features/directionsQuestionnaire/expertReportsService';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {ExpertReports} from "../../../../../main/common/models/directionsQuestionnaire/expertReports";
import {ExpertReportsOptions} from "../../../../../main/common/models/directionsQuestionnaire/expertReportsOptions";

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
      const expertReports = await getExpertReports('validClaimId');

      expect(expertReports.option).toBeUndefined();
    });

    it('should return sent expert reports option with Yes option', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.expertReports = {option: ExpertReportsOptions.OPTION_YES};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertReports = await getExpertReports('validClaimId');

      expect(expertReports.option).toBe(ExpertReportsOptions.OPTION_YES);
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getExpertReports('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveExpertReports', () => {
    const expertReports: ExpertReports = {
      option: ExpertReportsOptions.OPTION_YES,
    };

    it('should save sent expert reports successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveExpertReports('validClaimId', expertReports);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {expertReports}});
    });

    it('should update sent expert reports successfully', async () => {
      const updatedExpertReports: ExpertReports = {
        option: ExpertReportsOptions.OPTION_NO,
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.expertReports = updatedExpertReports;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.expertReports = updatedExpertReports;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveExpertReports('validClaimId', updatedExpertReports);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveExpertReports('claimId', {option: ExpertReportsOptions.OPTION_NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
