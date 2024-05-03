import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  saveAgreementFromOtherParty,
  saveApplicationType,
  saveRespondentAgreeToOrder,
} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationType, ApplicationTypeOption,} from 'common/models/generalApplication/applicationType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'common/form/models/yesNo';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {isDashboardServiceEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {CaseRole} from 'common/form/models/caseRoles';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

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

  describe('Save agreement from other party', () => {
    it('should save agreement from other party', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });

      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();

      //When
      await saveAgreementFromOtherParty('123',claim, YesNo.NO);
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given

      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      //Then
      await expect(saveAgreementFromOtherParty('123',claim, YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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

  describe('Save respondent agree to order', () => {
    it('should save respondent agree to order', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });

      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();

      //When
      await saveRespondentAgreeToOrder('123',claim, YesNo.NO);
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given

      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      //Then
      await expect(saveRespondentAgreeToOrder('123',claim, YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
