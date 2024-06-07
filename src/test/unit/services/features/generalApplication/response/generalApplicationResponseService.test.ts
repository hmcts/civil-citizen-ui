import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {YesNo} from 'common/form/models/yesNo';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {
  saveRespondentAgreeToOrder,
  saveRespondentHearingArrangement,
  saveRespondentHearingContactDetails,
  saveRespondentHearingSupport,
  saveRespondentUnavailableDates,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('General Application Response service', () => {

  describe('Save defendant agree to order', () => {
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
      claim.generalApplication.response = new GaResponse();

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

  describe('Save Application Response hearing arrangements', () => {
    const hearingArrangement = new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'reason for selection');
    it('should save application responsehearing arrangements', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.response = new GaResponse();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveRespondentHearingArrangement('123', hearingArrangement);
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
      await expect(saveRespondentHearingArrangement('123', hearingArrangement)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Respondent Hearing Contact Details', () => {
    const hearingContactDetails = new HearingContactDetails('04476211997', 'test@gmail.com');
    it('should save application response hearing contact details', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.response = new GaResponse();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      //When
      await saveRespondentHearingContactDetails('123', hearingContactDetails);
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
      await expect(saveRespondentHearingContactDetails('123', hearingContactDetails)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save respondent hearing support', () => {
    it('should save respondent hearing support', async () => {
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
      await saveRespondentHearingSupport('123',
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
      await expect(saveRespondentHearingSupport('123',
        new HearingSupport([]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save respondent unavailable hearing dates', () => {
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
      await saveRespondentUnavailableDates('123', claim, new UnavailableDatesGaHearing());
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
      await expect(saveRespondentUnavailableDates('123', claim, new UnavailableDatesGaHearing())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
