import {getExpertDetails} from '../../../../../../main/services/features/directionsQuestionnaire/expertDetailsService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import * as responseDraftStoreService from '../../../../../../main/modules/draft-store/response/responseDraftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {ExpertDetailsList} from '../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetailsList';
import {DirectionQuestionnaire} from '../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Experts} from '../../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ExpertDetails} from '../../../../../../main/common/models/directionsQuestionnaire/experts/expertDetails';
import {CaseState} from '../../../../../../main/common/form/models/claimDetails';
import {ClaimantResponse} from '../../../../../../main/common/models/claimantResponse';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;

const mockExpertDetails: ExpertDetails = new ExpertDetails('Joe', 'Doe', 'test@test.com', 600000000, 'Test', 'Test', 100);
export const mockExpertDetailsList: ExpertDetailsList = new ExpertDetailsList([mockExpertDetails]);

const claim = new Claim();
claim.directionQuestionnaire = new DirectionQuestionnaire();
claim.directionQuestionnaire.experts = new Experts();
claim.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;

const mockReq = {
  params: {id: 'validClaimId'},
  session: {user: {id: 'userId'}},
} as unknown as AppRequest;

describe('Expert Details service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue('validClaimIduserId');
  });

  describe('Get Expert Details', () => {
    it('should return undefined if expertDetails is not set', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const expertDetails = await getExpertDetails(mockReq);
      expect(expertDetails.items.length).toBe(1);
      expect(expertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return expertDetails object', async () => {
      mockGetCaseDataFromDraftStore.mockResolvedValue(new Claim());
      mockGetResponseClaimById.mockResolvedValue(claim);

      const expertDetails = await getExpertDetails(mockReq);

      expect(expertDetails.items.length).toBe(1);
      expect(expertDetails.items[0].firstName).toBe('Joe');
      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, 'validClaimId');
    });

    it('should return claimant expertDetails object', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        claim.claimantResponse.directionQuestionnaire.experts = new Experts();
        claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
        return claim;
      });

      //When
      const claimantExpertDetails = await getExpertDetails(mockReq);

      //Then
      expect(claimantExpertDetails.items.length).toBe(1);
      expect(claimantExpertDetails.items[0].firstName).toBe('Joe');
      expect(mockGetResponseClaimById).not.toHaveBeenCalled();
    });

    it('should return claimant new expertDetails object if expertDetails not existing', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        claim.claimantResponse.directionQuestionnaire.experts = new Experts();
        return claim;
      });

      //When
      const claimantExpertDetails = await getExpertDetails(mockReq);

      //Then
      expect(claimantExpertDetails.items.length).toBe(1);
      expect(claimantExpertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return claimant new expertDetails object if experts not existing', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
        return claim;
      });

      //When
      const claimantExpertDetails = await getExpertDetails(mockReq);

      //Then
      expect(claimantExpertDetails.items.length).toBe(1);
      expect(claimantExpertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return claimant new expertDetails object if DQ not existing', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        claim.claimantResponse = new ClaimantResponse();
        return claim;
      });

      //When
      const claimantExpertDetails = await getExpertDetails(mockReq);

      //Then
      expect(claimantExpertDetails.items.length).toBe(1);
      expect(claimantExpertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return claimant new expertDetails object if claimantResponse not existing', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });

      //When
      const claimantExpertDetails = await getExpertDetails(mockReq);

      //Then
      expect(claimantExpertDetails.items.length).toBe(1);
      expect(claimantExpertDetails.items[0].firstName).toBeUndefined();
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getExpertDetails(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
