import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {DirectionQuestionnaire} from '../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {
  getConsiderClaimantDocuments, saveConsiderClaimantDocuments,
} from '../../../../../main/services/features/directionsQuestionnaire/considerClaimantDocumentsService';
import {
  ConsiderClaimantDocuments,
} from '../../../../../main/common/models/directionsQuestionnaire/considerClaimantDocuments';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Consider Claimant Documents Service', () => {
  describe('getConsiderClaimantDocuments', () => {
    it('should return consider claimant documents object with undefined options', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const considerClaimantDocuments = await getConsiderClaimantDocuments('validClaimId');

      expect(considerClaimantDocuments.option).toBeUndefined();
      expect(considerClaimantDocuments.details).toBeUndefined();
    });

    it('should return consider claimant documents option with Yes option and details', async () => {
      const claim = new Claim();
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.considerClaimantDocuments = {option: YesNo.YES, details: 'details'};
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const considerClaimantDocuments = await getConsiderClaimantDocuments('validClaimId');

      expect(considerClaimantDocuments.option).toBe(YesNo.YES);
      expect(considerClaimantDocuments.details).toContain('details');
    });

    it('should return error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getConsiderClaimantDocuments('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveConsiderClaimantDocuments', () => {
    const considerClaimantDocuments: ConsiderClaimantDocuments = {
      option: YesNo.YES,
      details: 'details',
    };

    it('should save consider claimant documents successfully', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveConsiderClaimantDocuments('validClaimId', considerClaimantDocuments);
      expect(spySave).toHaveBeenCalledWith('validClaimId', {directionQuestionnaire: {considerClaimantDocuments}});
    });

    it('should update consider claimant documents successfully', async () => {
      const updatedConsiderClaimantDocuments: ConsiderClaimantDocuments = {
        option: YesNo.NO,
        details: 'updated',
      };
      const updatedClaim = new Claim();
      updatedClaim.directionQuestionnaire = new DirectionQuestionnaire();
      updatedClaim.directionQuestionnaire.considerClaimantDocuments = considerClaimantDocuments;
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.considerClaimantDocuments = considerClaimantDocuments;
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveConsiderClaimantDocuments('validClaimId', updatedConsiderClaimantDocuments);
      expect(spySave).toHaveBeenCalledWith('validClaimId', updatedClaim);
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveConsiderClaimantDocuments('claimId', {option: YesNo.NO}))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
