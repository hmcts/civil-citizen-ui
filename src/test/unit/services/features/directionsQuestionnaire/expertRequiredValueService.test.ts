import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {saveExpertRequiredValue} from 'services/features/directionsQuestionnaire/expertRequiredValueService';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {CaseState} from 'form/models/claimDetails';
import {ExpertReportDetails} from 'models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ExpertCanStillExamine} from 'models/directionsQuestionnaire/experts/expertCanStillExamine';
import {ExpertDetailsList} from 'models/directionsQuestionnaire/experts/expertDetailsList';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Expert Required Value service', () => {
  describe('Save Expert Required Value', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should save expert required successfully when expert doesnt exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        return claim;
      });
      //When
      await saveExpertRequiredValue('1234', true);
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save expert required successfully when DQ doesnt exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        return claim;
      });
      //When
      await saveExpertRequiredValue('1234', true);
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save expert required successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = new DirectionQuestionnaire();
        claim.directionQuestionnaire.experts = new Experts();
        return claim;
      });
      //When
      await saveExpertRequiredValue('1234', true);
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save expert required field for claimant response dq', async () => {
      //Given
      const id = '1234';
      const expertRequired = true;
      const claim = getClaimWithClaimantResponseDQ();
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveExpertRequiredValue(id, expertRequired);
      //Then
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeTruthy();
      expect(spySave).toHaveBeenCalledWith(id, claim);
    });
    it('should reset expert dq fields when expert required field on claimant response is false', async () => {
      //Given
      const id = '1234';
      const expertRequired = false;
      const claim = getClaimWithClaimantResponseDQ();
      claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
      claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = new GenericYesNo();
      claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine();
      claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList();
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveExpertRequiredValue(id, expertRequired);
      //Then
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeFalsy();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine).toBeNull();
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList).toBeNull();
      expect(spySave).toHaveBeenCalledWith(id, claim);
    });
    it('should save expert required when direction questionnaire and experts are not defined', async () => {
      //Given
      const id = '1234';
      const expertRequired = true;
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      claim.claimantResponse = new ClaimantResponse();
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return claim;
      });
      //When
      await saveExpertRequiredValue(id, expertRequired);
      //Then
      expect(claim.claimantResponse.directionQuestionnaire.experts.expertRequired).toBeTruthy();
      expect(spySave).toHaveBeenCalledWith(id, claim);
    });
    it('should throw error when draft store throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveExpertRequiredValue('1234', true)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
