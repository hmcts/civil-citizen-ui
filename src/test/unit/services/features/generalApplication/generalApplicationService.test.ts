import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  deleteGAFromClaimsByUserId,
  getApplicationIndex,
  getApplicationStatus,
  getByIndex,
  getByIndexOrLast,
  getCancelUrl,
  getDynamicHeaderForMultipleApplications,
  getViewApplicationUrl,
  isConfirmYouPaidCCJAppType,
  removeAllOtherApplications,
  resetClaimDataByApplicationType,
  saveAcceptDefendantOffer,
  saveAdditionalText,
  saveAgreementFromOtherParty,
  saveAndTriggerNotifyGaHwfEvent,
  saveApplicationCosts,
  saveApplicationType,
  saveApplicationTypesToGaResponse,
  saveHearingArrangement,
  saveHearingContactDetails,
  saveHearingSupport,
  saveHelpWithFeesDetails,
  saveRequestingReason,
  saveRespondentAgreement,
  saveRespondentWantToUploadDoc,
  saveUnavailabilityDatesConfirmation,
  saveUnavailableDates,
  saveWrittenRepText,
  shouldDisplaySyncWarning,
  updateByIndexOrAppend,
  validateAdditionalApplicationtType,
} from 'services/features/generalApplication/generalApplicationService';
import * as gaResponseDraftService
  from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {CaseRole} from 'common/form/models/caseRoles';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {CANCEL_URL} from 'routes/urls';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {RespondentAgreement} from 'common/models/generalApplication/response/respondentAgreement';
import {ValidationError} from 'class-validator';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {AcceptDefendantOffer} from 'common/models/generalApplication/response/acceptDefendantOffer';
import {isCUIReleaseTwoEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {ApplicationState, ApplicationStatus} from 'common/models/generalApplication/applicationSummary';
import {
  triggerNotifyHwfEvent,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {GaServiceClient} from 'client/gaServiceClient';
import {CCDGaHelpWithFees} from 'models/gaEvents/eventDto';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {CCDHelpWithFees} from 'form/models/claimDetails';
import {AppRequest} from 'models/AppRequest';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {OrderJudge} from 'models/generalApplication/orderJudge';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import clearAllMocks = jest.clearAllMocks;

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
jest.mock('../../../../../main/app/client/civilServiceClient');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockGetGaHwFDetails = getDraftGAHWFDetails as jest.Mock;
describe('General Application service', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('should save unavailable dates confirmation ', () => {
    it('should return save with yes ', async () => {
      //When
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = new Claim();
      claim.id = '123456';
      claim.generalApplication = new GeneralApplication();
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //given
      await saveUnavailabilityDatesConfirmation(claim.id, YesNo.YES);
      //Then
      expect(claim.generalApplication.hasUnavailableDatesHearing).toEqual('yes');
      expect(spy).toBeCalled();
    });

    it('should return save with no and remove all the unavailable dates if exists ', async () => {
      //When
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const claim = new Claim();
      claim.id = '123456';
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.unavailableDatesHearing = new UnavailableDatesGaHearing();

      //Given
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });

      //given
      await saveUnavailabilityDatesConfirmation(claim.id, YesNo.NO);
      //Then
      expect(claim.generalApplication.hasUnavailableDatesHearing).toEqual('no');
      expect(claim.generalApplication.unavailableDatesHearing).toEqual(undefined);
      expect(spy).toBeCalled();
    });

  });

  describe('removeAllOtherApplications', () => {
    it('should keep only the first element on applicationTypes', async () => {
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');

      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = Array.of(new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT),
        new ApplicationType(ApplicationTypeOption.OTHER));
      claim.generalApplication.orderJudges = Array.of(new OrderJudge('element1'), new OrderJudge('element2'));
      claim.generalApplication.requestingReasons = Array.of(new RequestingReason('element1'), new RequestingReason('element2'));

      await removeAllOtherApplications('111', claim);

      expect(spy).toBeCalled();
      expect(claim.generalApplication.applicationTypes.length).toEqual(1);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.SET_ASIDE_JUDGEMENT);

      expect(claim.generalApplication.orderJudges.length).toEqual(1);
      expect(claim.generalApplication.orderJudges[0]).toEqual(new OrderJudge('element1'));

      expect(claim.generalApplication.requestingReasons.length).toEqual(1);
      expect(claim.generalApplication.requestingReasons[0]).toEqual(new RequestingReason('element1'));

    });
  });

  describe('Save application type', () => {
    it('should save application type successfully', async () => {
      //Given
      mockGetCaseData.mockResolvedValue(new Claim());
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveApplicationType('123', new Claim(), new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
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
      await expect(saveApplicationType('123', new Claim(), new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING))).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
      await saveAgreementFromOtherParty('123', claim, YesNo.NO);
      //Then
      expect(spy).toBeCalled();
    });

    it('should delete inform other parties data upon agreement from other party is selected yes', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => {
        return new Claim();
      });

      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.informOtherParties = new InformOtherParties('no', 'dont specify to the defendant');
      //When
      await saveAgreementFromOtherParty('123', claim, YesNo.YES);
      //Then
      expect(spy).toBeCalled();
      expect(claim.generalApplication.informOtherParties).toBeUndefined();
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
      await expect(saveAgreementFromOtherParty('123', claim, YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
      (isCUIReleaseTwoEnabled as jest.Mock).mockReturnValueOnce(true);

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;

      claim.generalApplication = new GeneralApplication();

      //When
      const cancelUrl = await getCancelUrl('123', claim);
      //Then
      expect(cancelUrl).toEqual(CANCEL_URL.replace(':id', '123').replace(':propertyName', 'generalApplication'));
    });

    it('should return claimant old dashboard url when user is claimant and dashboard feature flag is disabled', async () => {
      //Given
      (isCUIReleaseTwoEnabled as jest.Mock).mockReturnValueOnce(false);

      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;

      claim.generalApplication = new GeneralApplication();

      //When
      const cancelUrl = await getCancelUrl('123', claim);
      //Then
      expect(cancelUrl).toEqual(CANCEL_URL.replace(':id', '123').replace(':propertyName', 'generalApplication'));
    });

    it('should return defendant dashboard url when user is defendent', async () => {
      //Given
      (isCUIReleaseTwoEnabled as jest.Mock).mockReturnValueOnce(false);

      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;

      claim.generalApplication = new GeneralApplication();

      //When
      const cancelUrl = await getCancelUrl('123', claim);
      //Then
      expect(cancelUrl).toEqual(CANCEL_URL.replace(':id', '123').replace(':propertyName', 'generalApplication'));
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

  describe('getDynamicHeaderForMultipleApplications', () => {
    it.each`
      selectedApplicationTypes                                                      | expectedHeader
      ${[]}                                                                         | ${'PAGES.GENERAL_APPLICATION.COMMON.MAKE_AN_APPLICATION'}
      ${undefined}                                                                  | ${'PAGES.GENERAL_APPLICATION.COMMON.MAKE_AN_APPLICATION'}
      ${[ApplicationTypeOption.ADJOURN_HEARING]}                                    | ${'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING'}
      ${[ApplicationTypeOption.ADJOURN_HEARING, ApplicationTypeOption.EXTEND_TIME]} | ${'PAGES.GENERAL_APPLICATION.COMMON.MAKE_AN_APPLICATION'}
    `('should return $expected when selected types are $selectedApplicationTypes',
      ({ selectedApplicationTypes, expectedHeader}) => {
        //When
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        if (selectedApplicationTypes) {
          claim.generalApplication.applicationTypes = selectedApplicationTypes.map((at: ApplicationTypeOption) => new ApplicationType(at));
        }
        //Then
        expect(getDynamicHeaderForMultipleApplications(claim)).toEqual(expectedHeader);
      });
  });

  describe('Get by index or last', () => {
    it.each`
      list           | index              | expected
      ${[1, 2, 3]}   | ${0}               | ${1}
      ${[1, 2, 3]}   | ${2}               | ${3}
      ${[1, 2, 3]}   | ${3}               | ${3}
      ${[1, 2, 3]}   | ${undefined}       | ${3}
      ${[]}          | ${0}               | ${undefined}
      ${undefined}   | ${0}               | ${undefined}
      ${undefined}   | ${undefined}       | ${undefined}
      `('should return $expected when retrieving index $index from $list',
      ({ list, index, expected }) => {
        expect(getByIndexOrLast(list, index)).toEqual(expected);
      });
  });

  describe('Get by index', () => {
    it.each`
      list           | index              | expected
      ${[1, 2, 3]}   | ${0}               | ${1}
      ${[1, 2, 3]}   | ${2}               | ${3}
      ${[1, 2, 3]}   | ${3}               | ${undefined}
      ${[1, 2, 3]}   | ${undefined}       | ${undefined}
      ${[]}          | ${0}               | ${undefined}
      ${undefined}   | ${0}               | ${undefined}
      ${undefined}   | ${undefined}       | ${undefined}
      `('should return $expected when retrieving index $index from $list',
      ({ list, index, expected }) => {
        expect(getByIndex(list, index)).toEqual(expected);
      });
  });

  describe('Update by index or append', () => {
    it.each`
    list           | index              | expected
    ${[1, 2, 3]}   | ${0}               | ${[9, 2, 3]}
    ${[1, 2, 3]}   | ${2}               | ${[1, 2, 9]}
    ${[1, 2, 3]}   | ${3}               | ${[1, 2, 3, 9]}
    ${[1, 2, 3]}   | ${undefined}       | ${[1, 2, 3, 9]}
    ${[]}          | ${0}               | ${[9]}
    `('should return $expected when retrieving index $index from $list',
      ({ list, index, expected }) => {
        updateByIndexOrAppend(list, 9, index);
        expect(list).toEqual(expected);
      });
  });

  describe('Save respondent agreement', () => {
    it('saves respondent agreement when no general agreement stored', async () => {
      jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
      const respondentAgreement = new RespondentAgreement(YesNo.YES);

      await saveRespondentAgreement('123', respondentAgreement);
      const gaResponse = new GaResponse();
      gaResponse.respondentAgreement = respondentAgreement;
      await expect(spy).toBeCalledWith('123', gaResponse);
    });

    it('saves respondent agreement when no response stored', async () => {
      // Given
      jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
      const respondentAgreement = new RespondentAgreement(YesNo.YES);
      // When
      await saveRespondentAgreement('123', respondentAgreement);
      // Then
      const gaResponse = new GaResponse();
      gaResponse.respondentAgreement = respondentAgreement;
      await expect(spy).toBeCalledWith('123', gaResponse);
    });

    it('overwrites respondent agreement', async () => {
      // Given
      const gaResponse = { respondentAgreement: new RespondentAgreement(YesNo.YES) };
      jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(gaResponse);
      const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
      // When
      const respondentAgreement = new RespondentAgreement(YesNo.NO, 'reason for disagreement');
      await saveRespondentAgreement('123', respondentAgreement);
      // Then
      const expectGAResponse = { respondentAgreement };
      await expect(spy).toBeCalledWith('123', expectGAResponse);
    });
  });

  describe('Validate additional application type', () => {
    it('should return error message if additional application type is in excluded list', () => {

      //Given
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM)];
      const errors : ValidationError[] = [];
      const applicationType = new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT);
      const body = {
        optionOther: 'test',
        option: 'testOption',
      };
      //When
      validateAdditionalApplicationtType(claim, errors, applicationType,body);

      //Then
      const error : ValidationError = errors[0];
      expect(errors.length).toBe(1);
      expect(error.constraints['additionalApplicationError']).toBe('ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_SETTLING');
    });
  });

  describe('Validate CCEJ is selected only if Active Judgment is there', () => {
    it('should return error message if active Judgment absent', () => {

      //Given
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID)];
      const errors : ValidationError[] = [];
      const applicationType = new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
      const body = {
        optionOther: 'test',
        option: 'testOption',
      };
      //When
      validateAdditionalApplicationtType(claim, errors, applicationType,body);

      //Then
      const error : ValidationError = errors[0];
      expect(errors.length).toBe(1);
      expect(error.constraints['ccjApplicationError']).toBe('ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_CCJ_DEBT');
    });
  });

  describe('Save help with application fee details', () => {
    it('should save help with application fee selection', async () => {
      const gaHwfFees = new GaHelpWithFees();
      //Given
      mockGetGaHwFDetails.mockImplementation(async () => {

        gaHwfFees.applyHelpWithFees = {option: YesNo.YES};
        return gaHwfFees;
      });

      const mockSaveGAHwFDetails = saveDraftGAHWFDetails as jest.Mock;
      //When
      await saveHelpWithFeesDetails('123', YesNo.YES, 'applyHelpWithFees');
      //Then
      expect(mockSaveGAHwFDetails).toBeCalledWith('123', gaHwfFees);
    });

    it('should save help with hwf application fee selection', async () => {
      const gaHwfFees = new GaHelpWithFees();
      const ccdClaim = new Claim();
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': 'testApp1',
            },
          },
        },
      ];
      //Given
      mockGetGaHwFDetails.mockImplementation(async () => {

        gaHwfFees.applyHelpWithFees = {option: YesNo.YES};
        return gaHwfFees;
      });
      const spyOnGA = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);
      //When
      await saveAndTriggerNotifyGaHwfEvent({params: {appId: '12334'}} as unknown as AppRequest, new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-A1B-36C'));
      expect(spyOnGA).toHaveBeenCalled();
    });

    it('should save help with application fee continue selection', async () => {
      const gaHwfFees = new GaHelpWithFees();
      //Given
      mockGetGaHwFDetails.mockImplementation(async () => {

        gaHwfFees.helpWithFeesRequested = YesNo.YES;
        return gaHwfFees;
      });
      const mockSaveGAHwFDetails = saveDraftGAHWFDetails as jest.Mock;
      //When
      await saveHelpWithFeesDetails('123', YesNo.YES, 'helpWithFeesRequested');
      //Then
      expect(mockSaveGAHwFDetails).toBeCalledWith('123', gaHwfFees);
    });

    it('should save help with application fee reference number', async () => {
      const gaHwfFees = new GaHelpWithFees();
      const hwfReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-123-86D');
      //Given
      mockGetGaHwFDetails.mockImplementation(async () => {

        gaHwfFees.helpFeeReferenceNumberForm = hwfReferenceNumberForm;
        return gaHwfFees;
      });
      const mockSaveGAHwFDetails = saveDraftGAHWFDetails as jest.Mock;
      //When
      await saveHelpWithFeesDetails('123', hwfReferenceNumberForm, 'helpFeeReferenceNumberForm');
      //Then
      expect(mockSaveGAHwFDetails).toBeCalledWith('123', gaHwfFees);
    });
  });

  describe('getApplicationStatus applicant', () => {
    it('should return IN_PROGRESS when APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return IN_PROGRESS when AWAITING_RESPONDENT_RESPONSE', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_RESPONDENT_RESPONSE;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return IN_PROGRESS when LISTING_FOR_A_HEARING', () => {
      //Given
      const applicationState = ApplicationState.LISTING_FOR_A_HEARING;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return TO_DO when AWAITING_APPLICATION_PAYMENT', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_APPLICATION_PAYMENT;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return IN_PROGRESS when HEARING_SCHEDULED', () => {
      //Given
      const applicationState = ApplicationState.HEARING_SCHEDULED;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return TO_DO when AWAITING_WRITTEN_REPRESENTATIONS', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return TO_DO when AWAITING_ADDITIONAL_INFORMATION', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_ADDITIONAL_INFORMATION;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return TO_DO when AWAITING_DIRECTIONS_ORDER_DOCS', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return TO_DO when APPLICATION_ADD_PAYMENT', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_ADD_PAYMENT;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return COMPLETE when ORDER_MADE', () => {
      //Given
      const applicationState = ApplicationState.ORDER_MADE;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when APPLICATION_DISMISSED', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_DISMISSED;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when APPLICATION_CLOSED', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_CLOSED;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when PROCEEDS_IN_HERITAGE', () => {
      //Given
      const applicationState = ApplicationState.PROCEEDS_IN_HERITAGE;
      //When
      const status = getApplicationStatus(true, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
  });

  describe('getApplicationStatus respondent', () => {
    it('should return IN_PROGRESS when APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return TO_DO when AWAITING_RESPONDENT_RESPONSE', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_RESPONDENT_RESPONSE;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return IN_PROGRESS when LISTING_FOR_A_HEARING', () => {
      //Given
      const applicationState = ApplicationState.LISTING_FOR_A_HEARING;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return IN_PROGRESS when AWAITING_APPLICATION_PAYMENT', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_APPLICATION_PAYMENT;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return IN_PROGRESS when HEARING_SCHEDULED', () => {
      //Given
      const applicationState = ApplicationState.HEARING_SCHEDULED;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return TO_DO when AWAITING_WRITTEN_REPRESENTATIONS', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return TO_DO when AWAITING_ADDITIONAL_INFORMATION', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_ADDITIONAL_INFORMATION;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return TO_DO when AWAITING_DIRECTIONS_ORDER_DOCS', () => {
      //Given
      const applicationState = ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.TO_DO);
    });
    it('should return IN_PROGRESS when APPLICATION_ADD_PAYMENT', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_ADD_PAYMENT;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.IN_PROGRESS);
    });
    it('should return COMPLETE when ORDER_MADE', () => {
      //Given
      const applicationState = ApplicationState.ORDER_MADE;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when APPLICATION_DISMISSED', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_DISMISSED;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when APPLICATION_CLOSED', () => {
      //Given
      const applicationState = ApplicationState.APPLICATION_CLOSED;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
    it('should return COMPLETE when PROCEEDS_IN_HERITAGE', () => {
      //Given
      const applicationState = ApplicationState.PROCEEDS_IN_HERITAGE;
      //When
      const status = getApplicationStatus(false, applicationState);
      //Then
      expect(status).toBe(ApplicationStatus.COMPLETE);
    });
  });
});

describe('Save Additional Text and Option', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should save GARespondentResponse successfully', async () => {
    //Given
    jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
    const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
    const uploadFile = YesNo.YES;
    const input = 'More info';
    //When
    await saveAdditionalText('123', input, uploadFile);
    //Then
    expect(spy).toBeCalled();
  });
});

describe('Save WrittenRep Text and Option', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should save GARespondentResponse successfully', async () => {
    //Given
    jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
    const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
    const uploadFile = YesNo.YES;
    const input = 'WrittenRep Text';
    //When
    await saveWrittenRepText('123', input, uploadFile);
    //Then
    expect(spy).toBeCalled();
  });
});

describe('Save Accept defendant offer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should save acceptDefendantOffer successfully', async () => {
    //Given
    jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
    const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
    const acceptDefendantOffer = new AcceptDefendantOffer(YesNo.YES);
    //When
    await saveAcceptDefendantOffer('123', acceptDefendantOffer);
    //Then
    expect(spy).toBeCalled();
  });

  describe('should save application type details on Ga Response', () => {
    it('should call Save and Notify event', async () => {
      const mockGetDraft = getDraftGARespondentResponse as jest.Mock;
      const mockSaveDraft = saveDraftGARespondentResponse as jest.Mock;
      mockGetDraft.mockResolvedValue(new GaResponse());
      await saveApplicationTypesToGaResponse(true, '12345', [ApplicationTypeOption.STAY_THE_CLAIM], {
        generalAppUrgency: YesNoUpperCamelCase.YES,
        reasonsForUrgency: '',
        urgentAppConsiderationDate: '2025-10-10',
      });
      expect(mockSaveDraft).toHaveBeenCalled();
    });
  });

  describe('Save Respondent support to upload document', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should save respondent support to upload document', async () => {
      //Given
      jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const spy = jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse');
      //When
      await saveRespondentWantToUploadDoc('123', YesNo.NO);
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      jest.spyOn(gaResponseDraftService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      //When
      jest.spyOn(gaResponseDraftService, 'saveDraftGARespondentResponse').mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveRespondentWantToUploadDoc('123', YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

describe('Should display sync warning', () => {
  let applicationResponse: ApplicationResponse;
  beforeEach(() => {
    applicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: {
          fee: undefined,
          paymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          additionalPaymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          serviceRequestReference: undefined,
        },
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '',
      last_modified: '',
      state: undefined,
    };
  });

  it('should not display if is application fee and state not awaiting payment', async () => {
    //Given
    applicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(false);
  });

  it('should not display if is additional fee and state not awaiting payment', async () => {
    //Given
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    applicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(false);
  });

  it('should display if is application fee and state is awaiting payment', async () => {
    //Given
    applicationResponse.state = ApplicationState.AWAITING_APPLICATION_PAYMENT;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should display if is additional fee and state is awaiting payment', async () => {
    //Given
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    applicationResponse.state = ApplicationState.APPLICATION_ADD_PAYMENT;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should display if is application fee and payment success not updated', async () => {
    //Given
    applicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
    applicationResponse.case_data.generalAppPBADetails.paymentDetails.status = undefined;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should display if is additional fee and payment success not updated', async () => {
    //Given
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    applicationResponse.state = ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION;
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentDetails.status = undefined;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });

  it('should not display if no GA response', async () => {
    //Given
    applicationResponse = undefined;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(false);
  });

  it('should trigger Event NotifyHelpWithFee', async () => {
    const mockClaimId = '123456';
    const spyTriggerEvent = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);
    const helpWithFeeInfo:CCDHelpWithFees = {helpWithFee: YesNoUpperCamelCase.YES, helpWithFeesReferenceNumber: 'HWF-123-86D'};
    const gaHwf:CCDGaHelpWithFees =  {generalAppHelpWithFees: helpWithFeeInfo};
    //When
    await triggerNotifyHwfEvent(mockClaimId, gaHwf, undefined);
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith(ApplicationEvent.NOTIFY_HELP_WITH_FEE, mockClaimId, gaHwf, undefined);
  });

  it('should call Save and Notify event', async () => {
    const mockClaimId = '123456';
    const spyTriggerEvent = jest.spyOn(GaServiceClient.prototype, 'submitEvent').mockResolvedValueOnce(undefined);
    const helpWithFeeInfo:CCDHelpWithFees = {helpWithFee: YesNoUpperCamelCase.YES, helpWithFeesReferenceNumber: 'HWF-123-86D'};
    const gaHwf:CCDGaHelpWithFees =  {generalAppHelpWithFees: helpWithFeeInfo};
    //When
    await triggerNotifyHwfEvent(mockClaimId, gaHwf, undefined);
    //Then
    expect(spyTriggerEvent).toHaveBeenCalled();
    expect(spyTriggerEvent).toHaveBeenCalledWith(ApplicationEvent.NOTIFY_HELP_WITH_FEE, mockClaimId, gaHwf, undefined);

    //Given
    applicationResponse.case_data.generalAppPBADetails.additionalPaymentServiceRef = 'ref';
    applicationResponse.state = ApplicationState.APPLICATION_ADD_PAYMENT;
    //When
    const result = shouldDisplaySyncWarning(applicationResponse);
    //Then
    expect(result).toEqual(true);
  });
});

describe('Should get the application index', () => {

  it('should return index without plus one on index.', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '1234',
      last_modified: '',
      state: undefined,
    };

    jest
      .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
      .mockResolvedValue([applicationResponse]);
    //When
    const result = await getApplicationIndex('123', '1234', undefined);
    //Then
    expect(result).toEqual(0);
  });

  it('should return index with plus one on index.', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '1234',
      last_modified: '',
      state: undefined,
    };

    jest
      .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
      .mockResolvedValue([applicationResponse]);
    //When
    const result = await getApplicationIndex('123', '1234', undefined, true);
    //Then
    expect(result).toEqual(1);
  });

  it('should return undefine', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: undefined,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '',
      last_modified: '',
      state: undefined,
    };

    jest
      .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
      .mockResolvedValue([applicationResponse]);
    //When
    const result = await getApplicationIndex('123', '1234', undefined);
    //Then
    expect(result).toEqual(-1);
  });

  describe('deleteGAFromClaimsByUserId', () => {
    it('should delete GAs by user id', async () => {
      //Given
      const mockSaveClaim = draftStoreService.findClaimIdsbyUserId as jest.Mock;
      mockSaveClaim.mockImplementation(async () => {
        return ['123', '234'];
      });
      const spy = jest.spyOn(draftStoreService, 'deleteFieldDraftClaimFromStore').mockImplementation();
      //When
      await deleteGAFromClaimsByUserId('123');
      //Then
      expect(spy).toBeCalledTimes(2);
    });
  });

  it('should return applicant view Application url when claimant is applicant and cliamant is viewing', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '123456',
      last_modified: '',
      state: undefined,
    };
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;

    //When
    const result = await getViewApplicationUrl('123', claim, applicationResponse, 1);
    //Then
    expect(result).toEqual('/case/123/general-application/123456/view-application?index=2');
  });

  it('should return respondent view Application url when claimant is applicant and respondent is viewing', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '123456',
      last_modified: '',
      state: undefined,
    };
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;

    //When
    const result = await getViewApplicationUrl('123', claim, applicationResponse, 1);
    //Then
    expect(result).toEqual('/case/123/response/general-application/123456/view-application?index=2');
  });

  it('should return respondent view Application url when respondent is applicant and claimant is viewing', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '123456',
      last_modified: '',
      state: undefined,
    };
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;

    //When
    const result = await getViewApplicationUrl('123', claim, applicationResponse, 1);
    //Then
    expect(result).toEqual('/case/123/response/general-application/123456/view-application?index=2');
  });

  it('should return respondent view Application url when respondent is applicant and respondent is viewing', async () => {
    const applicationResponse: ApplicationResponse = {
      case_data: {
        applicationTypes: undefined,
        generalAppType: undefined,
        generalAppRespondentAgreement: undefined,
        generalAppInformOtherParty: undefined,
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: undefined,
        generalAppReasonsOfOrder: undefined,
        generalAppEvidenceDocument: undefined,
        gaAddlDoc: undefined,
        generalAppHearingDetails: undefined,
        generalAppStatementOfTruth: undefined,
        generalAppPBADetails: undefined,
        applicationFeeAmountInPence: undefined,
        parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
        judicialDecision: undefined,
      },
      created_date: '',
      id: '123456',
      last_modified: '',
      state: undefined,
    };
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;

    //When
    const result = await getViewApplicationUrl('123', claim, applicationResponse, 1);
    //Then
    expect(result).toEqual('/case/123/general-application/123456/view-application?index=2');
  });

});

describe('should check if the application type on the case is "Confirm CCJ debt paid"', () => {
  it.each`
      selectedApplicationTypes                                                      | expectedOutput
      ${[]}                                                                         | ${false}
      ${undefined}                                                                  | ${false}
      ${[ApplicationTypeOption.ADJOURN_HEARING]}                                    | ${false}
      ${[ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID]}                              | ${true}
    `('should return $expectedOutput when selected type is $selectedApplicationTypes',
    ({ selectedApplicationTypes, expectedOutput}) => {
      //When
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      if (selectedApplicationTypes) {
        claim.generalApplication.applicationTypes = selectedApplicationTypes.map((at: ApplicationTypeOption) => new ApplicationType(at));
      }
      //Then
      expect(isConfirmYouPaidCCJAppType(claim)).toEqual(expectedOutput);
    });
});

describe('should Remove unnecessary data based on the type of application.', () => {

  it.each`
      applicationType                                                      | expectedOutput
      ${ApplicationTypeOption.SETTLE_BY_CONSENT}                                    | ${undefined}
      ${ApplicationTypeOption.SET_ASIDE_JUDGEMENT}                              | ${undefined}
    `('should return $expectedOutput when selected type is applicationType',
    ({ applicationType, expectedOutput}) => {
      //When
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.informOtherParties = new InformOtherParties();
      //given
      resetClaimDataByApplicationType(claim, new ApplicationType(applicationType));

      //Then
      expect(claim.generalApplication.informOtherParties).toEqual(expectedOutput);
    });

  it('should remove unnecessary Data when type of application is VARY_PAYMENT_TERMS_OF_JUDGMENT', async () => {
    //When
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.informOtherParties = new InformOtherParties();
    claim.generalApplication.requestingReasons = Array.of(new RequestingReason());
    claim.generalApplication.orderJudges = Array.of(new OrderJudge());
    claim.generalApplication.applicationCosts = YesNo.NO;
    //given
    resetClaimDataByApplicationType(claim, new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT));
    //Then
    expect(claim.generalApplication.informOtherParties).toEqual(undefined);
    expect(claim.generalApplication.requestingReasons).toEqual(undefined);
    expect(claim.generalApplication.orderJudges).toEqual(undefined);
    expect(claim.generalApplication.applicationCosts).toEqual(undefined);

  });

  it('should remove uploadN245Form Data when type of application is not VARY_PAYMENT_TERMS_OF_JUDGMENT', async () => {
    //When
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.uploadN245Form = new UploadGAFiles();
    //given
    resetClaimDataByApplicationType(claim, new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT));
    //Then
    expect(claim.generalApplication.uploadN245Form).toEqual(undefined);
  });

});
