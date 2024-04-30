import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('General Application service', () => {
  describe('Save application type', () => {
    it('should save application type successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveApplicationType('123', new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveApplicationType('123', new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
