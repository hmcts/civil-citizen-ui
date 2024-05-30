import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getCancelUrl,
  saveAgreementFromOtherParty,
  saveApplicationCosts,
  saveApplicationType,
  saveHearingSupport,
  saveRequestingReason,
  saveHearingArrangement,
  saveHearingContactDetails,
  saveUnavailableDates,
} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {YesNo} from 'common/form/models/yesNo';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {isDashboardServiceEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {CaseRole} from 'common/form/models/caseRoles';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';

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

  describe('Save hearing support', () => {
    it('should save hearing support', async () => {
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
      await saveHearingSupport('123',
        new HearingSupport([SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
          'test1', 'test2', 'test3'));
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
      await expect(saveHearingSupport('123',
        new HearingSupport([]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Application cost selection', () => {
    it('should save application costs selected', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveApplicationCosts('123', YesNo.YES);
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
      await expect(saveApplicationCosts('123', YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Unavailable hearing dates', () => {
    it('should save unavailable hearing dates selected', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });

      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      //When
      await saveUnavailableDates('123', claim, new UnavailableDatesGaHearing());
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
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      //Then
      await expect(saveUnavailableDates('123', claim, new UnavailableDatesGaHearing())).rejects.toThrow(TestMessages.REDIS_FAILURE);
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

  describe('Save requesting reason', () => {
    it('should save requesting reason', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveRequestingReason('123', new RequestingReason('reason'));
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
      await expect(saveRequestingReason('123', new RequestingReason('reason'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Application hearing arrangements', () => {
    const hearingArrangement = new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'reason for selection');
    it('should save application hearing arrangements', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveHearingArrangement('123', hearingArrangement);
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
      await expect(saveHearingArrangement('123', hearingArrangement)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Hearing Contact Details', () => {
    const hearingContactDetails = new HearingContactDetails('04476211997', 'test@gmail.com');
    it('should save application hearing contact details', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveHearingContactDetails('123', hearingContactDetails);
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
      await expect(saveHearingContactDetails('123', hearingContactDetails)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
