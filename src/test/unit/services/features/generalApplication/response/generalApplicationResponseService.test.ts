import * as draftStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import { YesNo } from 'common/form/models/yesNo';
import {
  saveRespondentAgreeToOrder,
  saveRespondentHearingArrangement,
  saveRespondentHearingContactDetails,
  saveRespondentHearingSupport,
  saveRespondentUnavailableDates,
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import { ApplicationTypeOption } from 'models/generalApplication/applicationType';
import {t} from 'i18next';
import { Claim } from 'common/models/claim';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn()
}))
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('General Application Response service', () => {
  beforeEach(() => {
    jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
  })
  afterEach(() => {
    jest.clearAllMocks();
  })

  describe('Save defendant agree to order', () => {
    it('should save respondent agree to order', async () => {
      //Given

      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentAgreeToOrder('123', YesNo.NO);
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given
      //   jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveRespondentAgreeToOrder('123', YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Application Response hearing arrangements', () => {
    const hearingArrangement = new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'reason for selection');
    it('should save application responsehearing arrangements', async () => {
      //Give
      //   jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentHearingArrangement('123', hearingArrangement);
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given
      //   jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveRespondentHearingArrangement('123', hearingArrangement)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save Respondent Hearing Contact Details', () => {
    const hearingContactDetails = new HearingContactDetails('04476211997', 'test@gmail.com');
    it('should save application response hearing contact details', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentHearingContactDetails('123', hearingContactDetails);
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveRespondentHearingContactDetails('123', hearingContactDetails)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save respondent hearing support', () => {
    it('should save respondent hearing support', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentHearingSupport('123',
        new HearingSupport([SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT],
          'test1', 'test2', 'test3'));
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveRespondentHearingSupport('123',
        new HearingSupport([]))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save respondent unavailable hearing dates', () => {
    it('should save unavailable hearing dates selected', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentUnavailableDates('123', new UnavailableDatesGaHearing());
      //Then
      expect(spy).toBeCalled();
    });

    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));;
      //Then
      await expect(saveRespondentUnavailableDates('123', new UnavailableDatesGaHearing())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Display for respondent caption', () => {
    it('should display when single application selected', () => {
      const claim = new Claim();
      claim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];
      //When
      const result = getRespondToApplicationCaption(claim, '345', 'en');
      //Then
      expect(result).toContain(t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO'));
    });

    it('should display when multiple application selected', () => {
      //Given
      const claim = new Claim();
      claim.respondentGaAppDetails = [{ generalAppTypes: [ApplicationTypeOption.ADJOURN_HEARING, ApplicationTypeOption.SUMMARY_JUDGMENT], gaApplicationId: '345', caseState: '', generalAppSubmittedDateGAspec: '' }];
      //When
      const result = getRespondToApplicationCaption(claim, '345', 'en');
      //Then
      expect(result).toContain(t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO'));
    });
  });
});
