import {getExpertDetails, saveExpertDetails}
  from '../../../../../../main/services/features/directionsQuestionnaire/expertDetailsService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {ExpertDetailsList} from '../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetailsList';
import {DirectionQuestionnaire} from '../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from '../../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ExpertDetails} from '../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetails';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

const mockExpertDetails: ExpertDetails = new ExpertDetails('Joe', 'Doe', 'test@test.com', 600000000, 'Test', 'Test', 100);
const mockExpertDetailsList: ExpertDetailsList = new ExpertDetailsList([mockExpertDetails]);

const claim = new Claim();
claim.directionQuestionnaire = new DirectionQuestionnaire();
claim.directionQuestionnaire.experts = new Experts();
claim.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;

describe('Expert Details service', () => {
  describe('Get Expert Details', () => {
    it('should return undefined if expertDetails is not set', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return new Claim();
      });
      const expertDetails = await getExpertDetails('validClaimId');
      expect(expertDetails.items).toHaveLength(1);
      expect(expertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return expertDetails object', async () => {

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertDetails = await getExpertDetails('validClaimId');

      expect(expertDetails.items).toHaveLength(1);
      expect(expertDetails.items[0].firstName).toBe('Joe');
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getExpertDetails('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveExpertDetails', () => {

    it('should save expert details successfully', async () => {
      const directionQuestionnaire = new DirectionQuestionnaire();
      const expertDetailsList: ExpertDetailsList = new ExpertDetailsList([
        new ExpertDetails('Joe', 'Doe', 'test@test.com', 600000000, 'Test', 'Test', 100)]);
      directionQuestionnaire.experts = new Experts();
      directionQuestionnaire.experts.expertDetailsList = expertDetailsList;

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      await saveExpertDetails('validClaimId', expertDetailsList, 'expertDetailsList');
      expect(spySave).toHaveBeenCalledWith('validClaimId', { directionQuestionnaire });
    });

    it('should return an error on redis failure', async () => {
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(saveExpertDetails('claimId', mockExpertDetailsList, 'expertDetailsList'))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

});
