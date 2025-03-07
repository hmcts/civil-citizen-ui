import * as draftStoreService
  from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {
  buildRespondentApplicationSummaryRow,
  getRespondToApplicationCaption,
  hideGAAppAsRespondentForClaimant,
  isApplicationVisibleToRespondent, isApplicationVisibleToRespondentForClaimant,
  saveRespondentAgreeToOrder,
  saveRespondentHearingArrangement,
  saveRespondentHearingContactDetails,
  saveRespondentHearingSupport,
  saveRespondentUnavailableDates,
  saveResponseUnavailabilityDatesConfirmation,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {t} from 'i18next';
import {
  ApplicationResponse,
  CCDApplication,
  JudicialDecisionRequestMoreInfoOptions,
} from 'common/models/generalApplication/applicationResponse';
import {ApplicationState, ApplicationSummary} from 'common/models/generalApplication/applicationSummary';
import {Claim} from 'common/models/claim';
import {CaseRole} from 'common/form/models/caseRoles';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('General Application Response service', () => {
  beforeEach(() => {
    jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  const applicationResponse = (state: ApplicationState, withNotice?: boolean, withConsent?: boolean, parentClaimantIsApplicant?: boolean): ApplicationResponse => {
    const ccdApplication: Partial<CCDApplication> = {
      applicationTypes: 'Vary order',
      generalAppInformOtherParty: withNotice ? {isWithNotice: YesNoUpperCamelCase.YES, reasonsForWithoutNotice: undefined} : {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
      generalAppRespondentAgreement: withConsent ? {hasAgreed: YesNoUpperCamelCase.YES} : {hasAgreed: YesNoUpperCamelCase.NO},
      parentClaimantIsApplicant: parentClaimantIsApplicant ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    };    return {
      id: '6789',
      case_data: ccdApplication as CCDApplication,
      state,
      last_modified: '2024-05-29T14:39:28.483971',
      created_date: '2024-05-29T14:39:28.483971',
    };
  };

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
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveRespondentUnavailableDates('123', new UnavailableDatesGaHearing())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Save respondent unavailable hearing dates confirmation', () => {
    it('should save unavailable hearing dates confirmation with NO', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveResponseUnavailabilityDatesConfirmation('123', YesNo.NO);
      //Then
      expect(spy).toBeCalledWith('123', {'acceptDefendantOffer': undefined, 'agreeToOrder': undefined, 'hasUnavailableDatesHearing': 'no', 'hearingArrangement': undefined, 'hearingContactDetails': undefined, 'hearingSupport': undefined, 'respondentAgreement': undefined, 'statementOfTruth': undefined, 'uploadEvidenceDocuments': [], 'wantToUploadDocuments': undefined});
    });

    it('should save unavailable hearing dates confirmation with YES', async () => {
      //Given
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      //When
      await saveResponseUnavailabilityDatesConfirmation('123', YesNo.YES);
      //Then
      expect(spy).toBeCalledWith('123', {'acceptDefendantOffer': undefined, 'agreeToOrder': undefined, 'hasUnavailableDatesHearing': 'yes', 'hearingArrangement': undefined, 'hearingContactDetails': undefined, 'hearingSupport': undefined, 'respondentAgreement': undefined, 'statementOfTruth': undefined, 'uploadEvidenceDocuments': [], 'wantToUploadDocuments': undefined});
    });

    it('should throw error when draft store throws error', async () => {
      //Given
      const mockSaveGaResponse = draftStoreService.saveDraftGARespondentResponse as jest.Mock;
      //When
      mockSaveGaResponse.mockRejectedValueOnce(new Error(TestMessages.REDIS_FAILURE));
      //Then
      await expect(saveResponseUnavailabilityDatesConfirmation('123', YesNo.NO)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('Display for respondent caption', () => {
    it('should display when single application selected', () => {
      const gaResponse = new GaResponse();
      gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
      //When
      const result = getRespondToApplicationCaption(gaResponse.generalApplicationType, 'en');
      //Then
      expect(result).toContain(t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO'));
    });

    it('should display when multiple application selected', () => {
      //Given
      const gaResponse = new GaResponse();
      gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING, ApplicationTypeOption.SUMMARY_JUDGEMENT];
      //When
      const result = getRespondToApplicationCaption(gaResponse.generalApplicationType, 'en');
      //Then
      expect(result).toContain(t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO'));
    });
  });

  describe('isApplicationVisibleToRespondent', () => {

    it('should return true when Claimant application is with notice', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.AWAITING_RESPONDENT_RESPONSE, true, false, true)))
        .toBeTruthy();
    });

    it('should return true when Claimant application is with consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.AWAITING_RESPONDENT_RESPONSE, false, true, true)))
        .toBeTruthy();
    });

    it('should return false when Claimant application is without notice nor consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.AWAITING_RESPONDENT_RESPONSE, false, false, true)))
        .toBeFalsy();
    });

    it('should return true when Defendant application is without notice or consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION, false, false, false)))
        .toBeTruthy();
    });

    it('should return true when Defendant application is with notice and with consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION, true, true, false)))
        .toBeTruthy();
    });

    it('should return true when Defendant application is with notice and without consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION, true, false, false)))
        .toBeTruthy();
    });

    it('should return true when Defendant application is without notice and with consent', () => {
      expect(isApplicationVisibleToRespondent(applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION, false, true, false)))
        .toBeTruthy();
    });

    it('should return true when Claimant application is without notice and court move to with notice after additional payment', () => {
      const ccdApplication : CCDApplication = {
        applicationFeeAmountInPence: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        applicationTypes: 'Vary order',
        generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
        generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecisionRequestMoreInfo: {
          judgeRequestMoreInfoText: undefined,
          judgeRequestMoreInfoByDate: undefined,
          deadlineForMoreInfoSubmission: undefined,
          isWithNotice: undefined,
          judgeRecitalText: undefined,
          requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY,
        },
        generalAppPBADetails : {
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
      };
      const applicationResponse = new ApplicationResponse(
        '6789',
        ccdApplication,
        ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(isApplicationVisibleToRespondent(applicationResponse)).toBeTruthy();
    });

    it('should return false when Claimant application is without notice and undefined fields', () => {
      const ccdApplication : CCDApplication = {
        applicationFeeAmountInPence: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        applicationTypes: 'Vary order',
        generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
        generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecisionRequestMoreInfo: {
          judgeRequestMoreInfoText: undefined,
          judgeRequestMoreInfoByDate: undefined,
          deadlineForMoreInfoSubmission: undefined,
          isWithNotice: undefined,
          judgeRecitalText: undefined,
          requestMoreInfoOption: undefined,
        },
        generalAppPBADetails : {
          fee: undefined,
          paymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          additionalPaymentDetails: {
            status: undefined,
            reference: undefined,
          },
          serviceRequestReference: undefined,
        },
      };
      const applicationResponse = new ApplicationResponse(
        '6789',
        ccdApplication,
        ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(isApplicationVisibleToRespondent(applicationResponse)).toBeFalsy();
    });

    it('should return false when application case data is undefined', () => {
      const applicationResponse = new ApplicationResponse(
        '6789',
        undefined,
        ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(isApplicationVisibleToRespondent(applicationResponse)).toBeFalsy();
    });

    it('should return false when Claimant application is without notice and undefined judicialDecisionRequestMoreInfo', () => {
      const ccdApplication : CCDApplication = {
        applicationFeeAmountInPence: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        applicationTypes: 'Vary order',
        generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
        generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecisionRequestMoreInfo: undefined,
        generalAppPBADetails : {
          fee: undefined,
          paymentDetails: {
            status: 'SUCCESS',
            reference: undefined,
          },
          additionalPaymentDetails: {
            status: undefined,
            reference: undefined,
          },
          serviceRequestReference: undefined,
        },
      };
      const applicationResponse = new ApplicationResponse(
        '6789',
        ccdApplication,
        ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(isApplicationVisibleToRespondent(applicationResponse)).toBeFalsy();
    });

    it('should return false when Claimant application is without notice and undefined PBA', () => {
      const ccdApplication : CCDApplication = {
        applicationFeeAmountInPence: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        applicationTypes: 'Vary order',
        generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
        generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecisionRequestMoreInfo: {
          judgeRequestMoreInfoText: undefined,
          judgeRequestMoreInfoByDate: undefined,
          deadlineForMoreInfoSubmission: undefined,
          isWithNotice: undefined,
          judgeRecitalText: undefined,
          requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY,
        },
        generalAppPBADetails : undefined,
      };
      const applicationResponse = new ApplicationResponse(
        '6789',
        ccdApplication,
        ApplicationState.AWAITING_RESPONDENT_RESPONSE,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(isApplicationVisibleToRespondent(applicationResponse)).toBeFalsy();
    });
    it('should return false when defendant application is without notice and undefined PBA', () => {
      const ccdApplication: CCDApplication = {
        applicationFeeAmountInPence: '',
        gaAddlDoc: [],
        generalAppAskForCosts: undefined,
        generalAppDetailsOfOrder: '',
        generalAppEvidenceDocument: [],
        generalAppHearingDetails: undefined,
        generalAppReasonsOfOrder: '',
        generalAppStatementOfTruth: undefined,
        generalAppType: undefined,
        judicialDecision: undefined,
        applicationTypes: 'EXTEND_TIME',
        generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO, reasonsForWithoutNotice: 'reasons'},
        generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
        parentClaimantIsApplicant: YesNoUpperCamelCase.YES,
        judicialDecisionRequestMoreInfo: {
          judgeRequestMoreInfoText: undefined,
          judgeRequestMoreInfoByDate: undefined,
          deadlineForMoreInfoSubmission: undefined,
          isWithNotice: undefined,
          judgeRecitalText: undefined,
          requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY,
        },
        generalAppPBADetails: undefined,
      };
      const applicationResponse = new ApplicationResponse(
        '6789',
        ccdApplication,
        ApplicationState.APPLICATION_ADD_PAYMENT,
        '2024-05-29T14:39:28.483971',
        '2024-05-29T14:39:28.483971',
      );

      expect(hideGAAppAsRespondentForClaimant(applicationResponse)).toBeFalsy();
    });
  });
  describe('hideGAAppAsRespondentForClaimant', () => {
    it('should return true when applicationIsCloaked is NO and state is not APPLICATION_ADD_PAYMENT', () => {
      const application = {
        case_data: {
          applicationIsCloaked: YesNoUpperCamelCase.NO,
          applicationIsUncloakedOnce: YesNoUpperCamelCase.NO,
        },
        state: ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,
      };
      expect(hideGAAppAsRespondentForClaimant(application as ApplicationResponse)).toBe(true);
    });

    it('should return true when applicationIsUncloakedOnce is YES', () => {
      const application = {
        case_data: {
          applicationIsCloaked: YesNoUpperCamelCase.NO,
          applicationIsUncloakedOnce: YesNoUpperCamelCase.YES,
        },
        state: ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,
      };
      expect(hideGAAppAsRespondentForClaimant(application as ApplicationResponse)).toBe(true);
    });

    it('should return false when state is APPLICATION_ADD_PAYMENT', () => {
      const application = {
        case_data: {
          applicationIsCloaked: YesNoUpperCamelCase.NO,
          applicationIsUncloakedOnce: YesNoUpperCamelCase.NO,
        },
        state: ApplicationState.APPLICATION_ADD_PAYMENT,
      };
      expect(hideGAAppAsRespondentForClaimant(application as ApplicationResponse)).toBe(false);
    });

    it('should return true when requestMoreInfoOption is SEND_APP_TO_OTHER_PARTY and status is SUCCESS', () => {
      const application = {
        case_data: {
          judicialDecisionRequestMoreInfo: {
            requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY,
          },
          generalAppPBADetails: {
            additionalPaymentDetails: {
              status: 'SUCCESS',
            },
          },
        },
        state: ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,
      };
      expect(hideGAAppAsRespondentForClaimant(application as ApplicationResponse)).toBe(true);
    });

    it('should return false when neither cloaking/uncloaking nor judicial decision conditions are met', () => {
      const application = {
        case_data: {
          applicationIsCloaked: YesNoUpperCamelCase.NO,
          applicationIsUncloakedOnce: YesNoUpperCamelCase.NO,
          judicialDecisionRequestMoreInfo: {
            requestMoreInfoOption: 'OTHER_OPTION',
          },
          generalAppPBADetails: {
            additionalPaymentDetails: {
              status: 'PENDING',
            },
          },
        },
        state: ApplicationState.APPLICATION_ADD_PAYMENT,
      };
      expect(hideGAAppAsRespondentForClaimant(application as ApplicationResponse)).toBe(false);
    });
  });
  describe('buildRespondentApplicationSummaryRow', () => {

    it('returns row awaiting respondent response state', () => {
      const appResponse = applicationResponse(ApplicationState.AWAITING_RESPONDENT_RESPONSE,false, false, true);
      const ccdClaim = new Claim();
      ccdClaim.caseRole = CaseRole.DEFENDANT;
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '6789',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      expect(buildRespondentApplicationSummaryRow('12345', 'en', ccdClaim)(appResponse, 0))
        .toStrictEqual({
          state: t('PAGES.GENERAL_APPLICATION.SUMMARY.STATES.AWAITING_RESPONDENT_RESPONSE'),
          status: t('PAGES.GENERAL_APPLICATION.SUMMARY.TO_DO'),
          statusColor: 'govuk-tag--red',
          types: 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER',
          id: '6789',
          createdDate: '29 May 2024, 2:39:28 pm',
          applicationUrl: '/case/12345/response/general-application/6789/view-application?index=1',
        } as ApplicationSummary);
    });

    it('returns row awaiting respondent response state', () => {
      const appResponse = applicationResponse(ApplicationState.AWAITING_RESPONDENT_RESPONSE,false, false, true);
      const ccdClaim = new Claim();
      ccdClaim.caseRole = CaseRole.DEFENDANT;
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '6789',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      expect(buildRespondentApplicationSummaryRow('12345', 'en', ccdClaim)(appResponse, 0))
        .toStrictEqual({
          state: t('PAGES.GENERAL_APPLICATION.SUMMARY.STATES.AWAITING_RESPONDENT_RESPONSE'),
          status: t('PAGES.GENERAL_APPLICATION.SUMMARY.TO_DO'),
          statusColor: 'govuk-tag--red',
          types: 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER',
          id: '6789',
          createdDate: '29 May 2024, 2:39:28 pm',
          applicationUrl: '/case/12345/response/general-application/6789/view-application?index=1',
        } as ApplicationSummary);
    });

    it('returns row in awaiting judicial decision state with multiples applications type', () => {
      const appResponse = applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,false, false, true);
      appResponse.case_data.applicationTypes = 'Vary order, Extend time';
      const ccdClaim = new Claim();
      ccdClaim.caseRole = CaseRole.DEFENDANT;
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '6789',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      expect(buildRespondentApplicationSummaryRow('12345', 'en', ccdClaim)(appResponse, 0))
        .toStrictEqual({
          state: t('PAGES.GENERAL_APPLICATION.SUMMARY.STATES.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION'),
          status: t('PAGES.GENERAL_APPLICATION.SUMMARY.IN_PROGRESS'),
          statusColor: 'govuk-tag--green',
          types: 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER, PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.EXTEND_TIME',
          id: '6789',
          createdDate: '29 May 2024, 2:39:28 pm',
          applicationUrl: '/case/12345/response/general-application/6789/view-application?index=1',
        } as ApplicationSummary);
    });

    it('returns row in awaiting judicial decision state with applicant view application', () => {
      const appResponse = applicationResponse(ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION);
      appResponse.case_data.parentClaimantIsApplicant = YesNoUpperCamelCase.NO;
      const ccdClaim = new Claim();
      ccdClaim.caseRole = CaseRole.DEFENDANT;
      ccdClaim.generalApplications = [
        {
          'id': 'test',
          'value': {
            'caseLink': {
              'CaseReference': '6789',
            },
            'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
          },
        },
      ];

      expect(buildRespondentApplicationSummaryRow('12345', 'en', ccdClaim)(appResponse, 0))
        .toStrictEqual({
          state: t('PAGES.GENERAL_APPLICATION.SUMMARY.STATES.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION'),
          status: t('PAGES.GENERAL_APPLICATION.SUMMARY.IN_PROGRESS'),
          statusColor: 'govuk-tag--green',
          types: 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER',
          id: '6789',
          createdDate: '29 May 2024, 2:39:28 pm',
          applicationUrl: '/case/12345/general-application/6789/view-application?index=1',
        } as ApplicationSummary);
    });
  });
  describe('isApplicationVisibleToRespondentForClaimant', () => {
    const baseApplication = {
      case_data: {},
      state: '',
    };

    test('should return true when parentClaimantIsApplicant is NO and isWithNotice is YES', () => {
      const application = {
        ...baseApplication,
        case_data: {
          parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
          generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.YES},
        },
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    it('should return true when application is not cloaked and state is not APPLICATION_ADD_PAYMENT', () => {
      const application = {
        case_data: {applicationIsCloaked: YesNoUpperCamelCase.NO},
        state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    it('should return true when application is uncloaked once and state is not APPLICATION_ADD_PAYMENT', () => {
      const application = {
        ...baseApplication,
        case_data: {applicationIsUncloakedOnce: YesNoUpperCamelCase.YES},
        state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    test('should return true when parentClaimantIsApplicant is YES', () => {
      const application = {
        ...baseApplication,
        case_data: {parentClaimantIsApplicant: YesNoUpperCamelCase.YES},
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    test('should return true when respondent has agreed', () => {
      const application = {
        ...baseApplication,
        case_data: {
          generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.YES},
        },
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    test('should return false when application is cloaked and state is APPLICATION_ADD_PAYMENT', () => {
      const application = {
        ...baseApplication,
        case_data: {
          applicationIsCloaked: YesNoUpperCamelCase.YES,
        },
        state: ApplicationState.APPLICATION_ADD_PAYMENT,
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(false);
    });

    test('should return true when judicial decision requests sending app to other party and payment is SUCCESS', () => {
      const application = {
        ...baseApplication,
        case_data: {
          judicialDecisionRequestMoreInfo: {
            requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY,
          },
          generalAppPBADetails: {
            additionalPaymentDetails: {status: 'SUCCESS'},
          },
        },
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(true);
    });

    it('should return false when requestMoreInfoOption is SEND_APP_TO_OTHER_PARTY but status is not SUCCESS', () => {
      const application = {
        case_data: {
          judicialDecisionRequestMoreInfo: {requestMoreInfoOption: JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY},
          generalAppPBADetails: {additionalPaymentDetails: {status: 'FAILED'}},
        }
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(false);
    });

    test('should return false when none of the conditions are met', () => {
      const application = {
        ...baseApplication,
        case_data: {
          parentClaimantIsApplicant: YesNoUpperCamelCase.NO,
          generalAppInformOtherParty: {isWithNotice: YesNoUpperCamelCase.NO},
          generalAppRespondentAgreement: {hasAgreed: YesNoUpperCamelCase.NO},
          applicationIsCloaked: YesNoUpperCamelCase.YES,
          applicationIsUncloakedOnce: YesNoUpperCamelCase.NO,
          judicialDecisionRequestMoreInfo: {
            requestMoreInfoOption: 'OTHER_OPTION',
          },
          generalAppPBADetails: {
            additionalPaymentDetails: {status: 'FAILED'},
          },
        } as unknown,
        state: ApplicationState.APPLICATION_ADD_PAYMENT,
      } as ApplicationResponse;
      expect(isApplicationVisibleToRespondentForClaimant(application)).toBe(false);
    });

  });
});
