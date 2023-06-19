import {Claim} from '../../../../../main/common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {saveExpertRequiredValue} from 'services/features/directionsQuestionnaire/expertRequiredValueService';
import {getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Expert Required Value service', () => {
  describe('Save Expert Required Value', () => {
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
    it('should throw error when draft store throws error', async () => {
      //When
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveExpertRequiredValue('1234', true))
      .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
