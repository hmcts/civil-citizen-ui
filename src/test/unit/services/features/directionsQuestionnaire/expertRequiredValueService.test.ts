import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {saveExpertRequiredValue} from 'services/features/directionsQuestionnaire/expertRequiredValueService';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as responseDraftStoreService from '../../../../../main/modules/draft-store/response/responseDraftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {CaseState} from 'form/models/claimDetails';
import {ExpertReportDetails} from 'models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ExpertCanStillExamine} from 'models/directionsQuestionnaire/experts/expertCanStillExamine';
import {ExpertDetailsList} from 'models/directionsQuestionnaire/experts/expertDetailsList';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
const mockGetResponseDraft = responseDraftStoreService.getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = responseDraftStoreService.updateResponseDraft as jest.Mock;

const mockReq = {
  params: {id: '1234'},
  session: {user: {id: 'userId'}},
} as unknown as AppRequest;

const redisKey = '1234userId';

describe('Expert Required Value service', () => {
  describe('Save Expert Required Value', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGenerateRedisKey.mockReturnValue(redisKey);
      mockGetResponseDraft.mockResolvedValue({
        claimResponse: {case_data: new Claim()},
        rawResponse: {draftId: 'draft-1'},
        createdAt: new Date().toISOString(),
      });
      mockUpdateResponseDraft.mockResolvedValue(undefined);
      mockSaveDraftClaim.mockResolvedValue(undefined);
    });

    it('should save expert required successfully when expert doesnt exist', async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        return claim;
      });
      mockGetResponseDraft.mockResolvedValue({
        claimResponse: {
          case_data: Object.assign(new Claim(), {
            directionQuestionnaire: new DirectionQuestionnaire(),
          }),
        },
        rawResponse: {draftId: 'draft-1'},
        createdAt: new Date().toISOString(),
      });

      await saveExpertRequiredValue(mockReq, true);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
    });

    it('should save expert required successfully when DQ doesnt exist', async () => {
      mockGetCaseDataFromStore.mockImplementation(async () => new Claim());
      mockGetResponseDraft.mockResolvedValue({
        claimResponse: {case_data: new Claim()},
        rawResponse: {draftId: 'draft-1'},
        createdAt: new Date().toISOString(),
      });

      await saveExpertRequiredValue(mockReq, true);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
    });

    it('should save expert required successfully', async () => {
      const defendantClaim = new Claim();
      defendantClaim.directionQuestionnaire = new DirectionQuestionnaire();
      defendantClaim.directionQuestionnaire.experts = new Experts();
      mockGetCaseDataFromStore.mockImplementation(async () => new Claim());
      mockGetResponseDraft.mockResolvedValue({
        claimResponse: {case_data: defendantClaim},
        rawResponse: {draftId: 'draft-1'},
        createdAt: new Date().toISOString(),
      });

      await saveExpertRequiredValue(mockReq, true);

      expect(mockUpdateResponseDraft).toHaveBeenCalled();
    });

    it('should save expert required field for claimant response dq', async () => {
      const claim = getClaimWithClaimantResponseDQ();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);

      await saveExpertRequiredValue(mockReq, true);

      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeTruthy();
      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should reset expert dq fields when expert required field on claimant response is false', async () => {
      const claim = getClaimWithClaimantResponseDQ();
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = new GenericYesNo();
      claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine();
      claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);

      await saveExpertRequiredValue(mockReq, false);

      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeFalsy();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList).toBeNull();
      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
    });

    it('should save expert required when direction questionnaire and experts are not defined', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);

      await saveExpertRequiredValue(mockReq, true);

      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeTruthy();
      expect(mockSaveDraftClaim).toHaveBeenCalledWith(redisKey, claim);
    });

    it('should throw error when draft store throws error', async () => {
      mockGetCaseDataFromStore.mockResolvedValue(new Claim());
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveExpertRequiredValue(mockReq, true)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

const getClaimWithClaimantResponseDQ = () => {
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
  claim.claimantResponse.directionQuestionnaire.experts = new Experts();
  return claim;
};
