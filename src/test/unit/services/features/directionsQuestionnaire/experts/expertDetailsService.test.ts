import {getExpertDetails} from 'services/features/directionsQuestionnaire/expertDetailsService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

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
      expect(expertDetails.items.length).toBe(1);
      expect(expertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return expertDetails object', async () => {

      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return claim;
      });
      const expertDetails = await getExpertDetails('validClaimId');

      expect(expertDetails.items.length).toBe(1);
      expect(expertDetails.items[0].firstName).toBe('Joe');
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getExpertDetails('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
