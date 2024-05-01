import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  saveApplicationType,
  saveHearingSupport,
} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {isDashboardServiceEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseRole} from 'form/models/caseRoles';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('General Application service', () => {
  describe('Save application type', () => {
    it('should save application type successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveClaim.mockRestore();
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveApplicationType('123', new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
      //Then
      expect(spy).toBeCalled();
    });
    it('saveApplicationType should throw error when draft store throws error', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveApplicationType('123', new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save hearing support', () => {
    it('should save hearing support successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      mockSaveClaim.mockRestore();
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveHearingSupport('123',
        new HearingSupport([SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
          'test1', 'test2', 'test3'));
      //Then
      expect(spy).toBeCalled();
    });
    it('saveHearingSupport should throw error when draft store throws error', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveHearingSupport('123',
        new HearingSupport([]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Get cancel button url', () => {
    it('should return claimant new dashboard url when user is claimant and dashboard feature flag is enabled', async () => {
      //Given
      (isDashboardServiceEnabled as jest.Mock).mockReturnValueOnce(true);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.generalApplication = new GeneralApplication();
      //When
      const cancelUrl = await getCancelUrl('123',claim);
      //Then
      expect(cancelUrl).toEqual(DASHBOARD_CLAIMANT_URL.replace(':id','123'));
    });
    it('should return claimant old dashboard url when user is claimant and dashboard feature flag is disabled', async () => {
      //Given
      (isDashboardServiceEnabled as jest.Mock).mockReturnValueOnce(false);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.generalApplication = new GeneralApplication();
      //When
      const cancelUrl = await getCancelUrl('123',claim);
      //Then
      expect(cancelUrl).toEqual(OLD_DASHBOARD_CLAIMANT_URL.replace(':id','123'));
    });
    it('should return defendant dashboard url when user is defendent', async () => {
      //Given
      (isDashboardServiceEnabled as jest.Mock).mockReturnValueOnce(false);
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      claim.generalApplication = new GeneralApplication();
      //When
      const cancelUrl = await getCancelUrl('123',claim);
      //Then
      expect(cancelUrl).toEqual(DEFENDANT_SUMMARY_URL.replace(':id','123'));
    });
  });
});
