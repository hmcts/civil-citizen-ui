import {
  deleteFieldDraftClaimFromStore,
  findClaimIdsbyUserId,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {
  ApplicationType,
  ApplicationTypeOption,
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'common/models/generalApplication/applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {Claim} from 'models/claim';
import {
  CANCEL_URL,
  GA_APPLICATION_RESPONSE_SUMMARY_URL,
  GA_APPLICATION_SUMMARY_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_VIEW_APPLICATION_URL,
} from 'routes/urls';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {AppRequest} from 'common/models/AppRequest';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ValidationError} from 'class-validator';
import {InformOtherParties} from 'common/models/generalApplication/informOtherParties';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {OrderJudge} from 'common/models/generalApplication/orderJudge';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {RespondentAgreement} from 'common/models/generalApplication/response/respondentAgreement';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {
  AcceptDefendantOffer,
  ProposedPaymentPlanOption,
} from 'common/models/generalApplication/response/acceptDefendantOffer';
import {ApplicationState, ApplicationStatus} from 'common/models/generalApplication/applicationSummary';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import config from 'config';
import {GaServiceClient} from 'client/gaServiceClient';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from './response/generalApplicationResponseStoreService';
import {CCDGaHelpWithFees} from 'models/gaEvents/eventDto';
import {
  triggerNotifyHwfEvent,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {isApplicationVisibleToRespondent} from './response/generalApplicationResponseService';
import {iWantToLinks} from 'common/models/dashboard/iWantToLinks';
import {t} from 'i18next';
import {GeneralAppUrgencyRequirement} from 'models/generalApplication/response/urgencyRequirement';
import {exhaustiveMatchingGuard} from 'services/genericService';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const baseUrl: string = config.get<string>('services.generalApplication.url');
const generalApplicationClient = new GaServiceClient(baseUrl);

export const saveApplicationType = async (claimId: string, claim: Claim, applicationType: ApplicationType, index?: number): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    updateByIndexOrAppend(claim.generalApplication?.applicationTypes, applicationType, index);
    resetClaimDataByApplicationType(claim, applicationType);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const removeAllOtherApplications = async (claimId: string, claim: Claim): Promise<void> => {
  try {
    claim.generalApplication.applicationTypes = [claim.generalApplication.applicationTypes[0]];
    claim.generalApplication.orderJudges = [claim.generalApplication.orderJudges[0]];
    claim.generalApplication.requestingReasons = [claim.generalApplication.requestingReasons[0]];
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveInformOtherParties = async (redisKey: string, informOtherParties: InformOtherParties): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.informOtherParties = informOtherParties;
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentAgreement = async (redisKey: string, respondentAgreement: RespondentAgreement): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.respondentAgreement = respondentAgreement;

    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAcceptDefendantOffer = async (redisKey: string, acceptDefendantOffer: AcceptDefendantOffer): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    if (acceptDefendantOffer.option === YesNo.YES) {
      delete acceptDefendantOffer.type;
      delete acceptDefendantOffer.amountPerMonth;
      delete acceptDefendantOffer.reasonProposedInstalment;
      delete acceptDefendantOffer.day;
      delete acceptDefendantOffer.month;
      delete acceptDefendantOffer.year;
      delete acceptDefendantOffer.reasonProposedSetDate;
    } else {
      if (acceptDefendantOffer.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS) {
        delete acceptDefendantOffer.day;
        delete acceptDefendantOffer.month;
        delete acceptDefendantOffer.year;
        delete acceptDefendantOffer.reasonProposedSetDate;
      } else {
        delete acceptDefendantOffer.amountPerMonth;
        delete acceptDefendantOffer.reasonProposedInstalment;
      }
    }
    gaResponse.acceptDefendantOffer = Object.assign(new AcceptDefendantOffer(), acceptDefendantOffer);
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveOrderJudge = async (claimId: string, orderJudge: OrderJudge, index: number): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    const orderJudges = claim.generalApplication?.orderJudges || [];
    updateByIndexOrAppend(orderJudges, orderJudge, index);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHearingSupport = async (claimId: string, hearingSupport: HearingSupport): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.hearingSupport = hearingSupport;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAgreementFromOtherParty = async (claimId: string, claim: Claim, agreementFromOtherParty: YesNo): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.agreementFromOtherParty = agreementFromOtherParty;
    if (agreementFromOtherParty === YesNo.YES && claim.generalApplication.informOtherParties?.option) {
      claim.generalApplication.informOtherParties = undefined;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveApplicationCosts = async (claimId: string, applicationCosts: YesNo): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationCosts = applicationCosts;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveIfPartyWantsToUploadDoc = async (redisKey: string, wantToSaveDoc: YesNo): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim.generalApplication.wantToUploadDocuments = wantToSaveDoc;
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getCancelUrl = async (claimId: string, claim: Claim): Promise<string> => {
  return CANCEL_URL
    .replace(':id', claimId)
    .replace(':propertyName', 'generalApplication');
};

export function validateNoConsentOption(req: AppRequest, errors: ValidationError[], applicationTypeOption: string) {

  if (req.body.option === YesNo.NO && applicationTypeOption === ApplicationTypeOption.SETTLE_BY_CONSENT) {

    const validationError = new FormValidationError({
      target: new GenericYesNo(req.body.option, ''),
      value: req.body.option,
      constraints: {
        shouldNotBeNoForSettleByConsent: 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_OPTION_NO_SELECTED',
      },
      property: 'option',
    });

    errors.push(validationError);
  }
}

export const saveUnavailableDates = async (claimId: string, claim: Claim, unavailableDates: UnavailableDatesGaHearing): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    while (unavailableDates?.items?.length > 0 && !unavailableDates.items[unavailableDates.items.length - 1].type) {
      unavailableDates?.items.pop();
    }
    claim.generalApplication.unavailableDatesHearing = unavailableDates;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRequestingReason = async (claimId: string, requestingReason: RequestingReason, index?: number): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    updateByIndexOrAppend(claim.generalApplication?.requestingReasons, requestingReason, index);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveN245Form = async (redisKey: string, claim: Claim, fileDetails: UploadGAFiles): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.uploadN245Form = fileDetails;
    await saveDraftClaim(redisKey, claim);
  }catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHearingArrangement = async (claimId: string, hearingArrangement: HearingArrangement): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.hearingArrangement = hearingArrangement;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHearingContactDetails = async (claimId: string, hearingContactDetails: HearingContactDetails): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.hearingContactDetails = hearingContactDetails;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveStatementOfTruth = async (claimId: string, statementOfTruth: StatementOfTruthForm): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.statementOfTruth = statementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getDynamicHeaderForMultipleApplications = (claim: Claim): string => {
  const applicationTypes = claim.generalApplication?.applicationTypes;
  return (applicationTypes?.length === 1)
    ? getApplicationTypeOptionByTypeAndDescription(applicationTypes[0].option, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE)
    : 'PAGES.GENERAL_APPLICATION.COMMON.MAKE_AN_APPLICATION';
};

export const getByIndexOrLast = <T>(array: T[] | undefined, index: number | undefined): T | undefined =>
  getByIndex(array, index)
  || ((array?.length)
    ? (array[array.length - 1])
    : undefined);

export const getByIndex = <T>(array: T[] | undefined, index: number | undefined): T | undefined =>
  (array?.length && index >= 0 && index < array.length)
    ? array[index]
    : undefined;

export const getLast = <T>(array: T[] | undefined): T | undefined =>
  (array?.length) ? array[array.length - 1] : undefined;

export const updateByIndexOrAppend = <T>(array: T[], newElem: T, index: number | undefined): void => {
  if (index >= 0 && index < array.length) {
    array[index] = newElem;
  } else {
    array.push(newElem);
  }
};

export const validateAdditionalApplicationtType = (claim : Claim, errors : ValidationError[], applicationType : ApplicationType,body : any) => {

  if(claim.generalApplication?.applicationTypes?.length > 0 && getListOfNotAllowedAdditionalAppType().includes(applicationType.option)) {
    const errorMessage = additionalApplicationErrorMessages[applicationType.option];

    const validationError = new FormValidationError({
      target: new GenericYesNo(body.optionOther, ''),
      value: body.option,
      constraints: {
        additionalApplicationError : errorMessage,
      },
      property: 'option',
    });

    errors.push(validationError);
  } else if (applicationType.option === ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID && (claim.joIsLiveJudgmentExists === undefined || claim.joIsLiveJudgmentExists?.option === YesNo.NO)) {

    const validationError = new FormValidationError({
      target: new GenericYesNo(body.optionOther, ''),
      value: body.option,
      constraints: {
        ccjApplicationError : 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_CCJ_DEBT',
      },
      property: 'option',
    });
    errors.push(validationError);
  }
};

export const getListOfNotAllowedAdditionalAppType = () => {
  return [ApplicationTypeOption.SET_ASIDE_JUDGEMENT,
    ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT,
    ApplicationTypeOption.SETTLE_BY_CONSENT];
};

export const additionalApplicationErrorMessages: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_SETTLING',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_CANCEL_JUDGMENT',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_VARY_JUDGMENT',
};

export const saveHelpWithFeesDetails = async (gaRedisKey: string, value: any, hwfPropertyName: keyof GaHelpWithFees): Promise<void> => {
  try {
    const gaHwFDetails = await getDraftGAHWFDetails(gaRedisKey);
    gaHwFDetails[hwfPropertyName] = value;
    await saveDraftGAHWFDetails(gaRedisKey, gaHwFDetails);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAndTriggerNotifyGaHwfEvent = async (req: AppRequest, gaHwf: ApplyHelpFeesReferenceForm): Promise<void> => {
  try {
    const gaHelpWithFees: CCDGaHelpWithFees = {
      generalAppHelpWithFees: toCCDGeneralAppHelpWithFees(gaHwf),
    };
    await triggerNotifyHwfEvent(req.params.appId, gaHelpWithFees, req);
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};

const toCCDGeneralAppHelpWithFees = (helpWithFees: ApplyHelpFeesReferenceForm | undefined) => {
  if (!helpWithFees) return undefined;
  return {
    helpWithFee: toCCDYesNo(helpWithFees.option),
    helpWithFeesReferenceNumber: helpWithFees.referenceNumber,
  };
};

export const getApplicationStatus = (isApplicant: boolean, status: ApplicationState): ApplicationStatus => {
  if (isApplicant) {
    switch (status) {
      case ApplicationState.PENDING_APPLICATION_ISSUED:
      case ApplicationState.AWAITING_RESPONDENT_RESPONSE:
      case ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION:
      case ApplicationState.ADDITIONAL_RESPONSE_TIME_EXPIRED:
      case ApplicationState.ADDITIONAL_RESPONSE_TIME_PROVIDED:
      case ApplicationState.LISTING_FOR_A_HEARING:
      case ApplicationState.HEARING_SCHEDULED:
        return ApplicationStatus.IN_PROGRESS;
      case ApplicationState.APPLICATION_ADD_PAYMENT:
      case ApplicationState.APPLICATION_PAYMENT_FAILED:
      case ApplicationState.AWAITING_APPLICATION_PAYMENT:
      case ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS:
      case ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS:
      case ApplicationState.AWAITING_ADDITIONAL_INFORMATION:
      case ApplicationState.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION:
        return ApplicationStatus.TO_DO;
      case ApplicationState.ORDER_MADE:
      case ApplicationState.APPLICATION_DISMISSED:
      case ApplicationState.APPLICATION_CLOSED:
      case ApplicationState.PROCEEDS_IN_HERITAGE:
        return ApplicationStatus.COMPLETE;
      default:
        exhaustiveMatchingGuard(status);
    }
  } else {
    switch (status) {
      case ApplicationState.PENDING_APPLICATION_ISSUED:
      case ApplicationState.APPLICATION_ADD_PAYMENT:
      case ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION:
      case ApplicationState.ADDITIONAL_RESPONSE_TIME_EXPIRED:
      case ApplicationState.LISTING_FOR_A_HEARING:
      case ApplicationState.HEARING_SCHEDULED:
      case ApplicationState.APPLICATION_PAYMENT_FAILED:
      case ApplicationState.AWAITING_APPLICATION_PAYMENT:
        return ApplicationStatus.IN_PROGRESS;
      case ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS:
      case ApplicationState.AWAITING_RESPONDENT_RESPONSE:
      case ApplicationState.ADDITIONAL_RESPONSE_TIME_PROVIDED:
      case ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS:
      case ApplicationState.AWAITING_ADDITIONAL_INFORMATION:
      case ApplicationState.RESPOND_TO_JUDGE_WRITTEN_REPRESENTATION:
        return ApplicationStatus.TO_DO;
      case ApplicationState.ORDER_MADE:
      case ApplicationState.APPLICATION_DISMISSED:
      case ApplicationState.APPLICATION_CLOSED:
      case ApplicationState.PROCEEDS_IN_HERITAGE:
        return ApplicationStatus.COMPLETE;
      default:
        exhaustiveMatchingGuard(status);
    }
  }
};

export const getApplicationFromGAService = async (req: AppRequest, applicationId: string): Promise<ApplicationResponse> => {
  return await generalApplicationClient.getApplication(req, applicationId);
};

export const saveRespondentWantToUploadDoc = async (redisKey: string, wantToUploadDocuments: YesNo): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.wantToUploadDocuments = wantToUploadDocuments;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAdditionalText = async (redisKey: string, additionalText: string, wantToUploadAddlDocuments: YesNo): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.wantToUploadAddlDocuments = wantToUploadAddlDocuments;
    gaResponse.additionalText = additionalText;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveWrittenRepText = async (redisKey: string, writtenRepText: string, wantToUploadAddlDocuments: YesNo): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.wantToUploadAddlDocuments = wantToUploadAddlDocuments;
    gaResponse.writtenRepText = writtenRepText;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getClaimDetailsById = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication = gaApplication;
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const shouldDisplaySyncWarning = (applicationResponse: ApplicationResponse): boolean => {
  if (!applicationResponse) {
    return false;
  }
  const isAdditionalFee = !!applicationResponse?.case_data?.generalAppPBADetails?.additionalPaymentServiceRef;
  if (isAdditionalFee) {
    return applicationResponse?.state === ApplicationState.APPLICATION_ADD_PAYMENT
      || applicationResponse?.case_data?.generalAppPBADetails?.additionalPaymentDetails?.status !== 'SUCCESS';
  } else {
    return applicationResponse?.state === ApplicationState.AWAITING_APPLICATION_PAYMENT
      || applicationResponse?.case_data?.generalAppPBADetails?.paymentDetails?.status !== 'SUCCESS';
  }
};

export const getApplicationIndex = async(claimId: string, applicationId: string, req: AppRequest, indexWithPlusOne = false) : Promise<number> => {
  const applications = await generalApplicationClient.getApplicationsByCaseId(claimId, req);
  const index =  applications.findIndex(application => application.id == applicationId);
  return indexWithPlusOne? index + 1 : index;
};

export const isGaApplicant = (claim: Claim, application: ApplicationResponse) : boolean => {
  return ((claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.YES)
    || (!claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO));
};

export const toggleViewApplicationBuilderBasedOnUserAndApplicant = (claim: Claim, application: ApplicationResponse) : boolean => {
  if (hasRespondentResponded(application)) {
    return true;
  }
  return ((claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.YES)
      || (!claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO));
};

export const hasRespondentResponded = (application: ApplicationResponse) : boolean => {
  const responses = application.case_data.respondentsResponses;
  return (responses?.length > 0) && !!responses[0].value;
};

export const deleteGAFromClaimsByUserId = async (userId: string) : Promise<void> => {
  if (!userId) return;
  const claimsIds = await findClaimIdsbyUserId(userId);
  claimsIds?.forEach(async (claimId: string) => {
    const claim = await getCaseDataFromStore(claimId);
    await deleteFieldDraftClaimFromStore(claimId, claim, 'generalApplication');
  });
};

export const getViewApplicationUrl = (claimId: string, claim: Claim, application: ApplicationResponse, index: number ) : string => {
  const viewApplicationUrl = toggleViewApplicationBuilderBasedOnUserAndApplicant(claim, application) ? GA_VIEW_APPLICATION_URL : GA_RESPONSE_VIEW_APPLICATION_URL;
  return `${constructResponseUrlWithIdAndAppIdParams(claimId, application.id, viewApplicationUrl)}?index=${index + 1}`;
};

export const saveApplicationTypesToGaResponse = async (isAllowedToRespond: boolean, gaRedisKey: string, applicationTypes: ApplicationTypeOption[], generalAppUrgencyRequirement: GeneralAppUrgencyRequirement): Promise<void> => {
  if (isAllowedToRespond) {
    const gaResponse = await getDraftGARespondentResponse(gaRedisKey);
    gaResponse.generalAppUrgencyRequirement = generalAppUrgencyRequirement;
    gaResponse.generalApplicationType = applicationTypes;
    await saveDraftGARespondentResponse(gaRedisKey, gaResponse);
  }
};

export const getViewAllApplicationLink = async (req: AppRequest, claim: Claim, isGAFlagEnable: boolean, lng: string) : Promise<iWantToLinks> => {
  if(isGAFlagEnable) {
    let applications = await generalApplicationClient.getApplicationsByCaseId(req.params.id, req);
    applications = claim.isClaimant() ? applications : applications?.filter(isApplicationVisibleToRespondent);
    const allApplicationUrl = claim.isClaimant() ? GA_APPLICATION_SUMMARY_URL : GA_APPLICATION_RESPONSE_SUMMARY_URL;
    if(applications && applications.length > 0) {
      return {
        text: t('PAGES.DASHBOARD.SUPPORT_LINKS.VIEW_ALL_APPLICATIONS', {lng}),
        url: constructResponseUrlWithIdParams(req.params.id, allApplicationUrl),
      };
    }
  }
};

export const getApplicationCreatedDate = (ccdClaim: Claim, applicationId: string): string => {
  const ccdGeneralApplications = ccdClaim.generalApplications;
  for (const ccdGeneralApplication of ccdGeneralApplications) {
    if (ccdGeneralApplication.value.caseLink.CaseReference.toString() === applicationId.toString()){
      return ccdGeneralApplication.value.generalAppSubmittedDateGAspec.toString();
    }
  }
  return undefined;
};

export const isConfirmYouPaidCCJAppType = (claim: Claim): boolean => {
  const applicationType = getLast(claim.generalApplication?.applicationTypes)?.option;
  return applicationType === ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID;
};

export const resetClaimDataByApplicationType = (claim: Claim, applicationType: ApplicationType): void => {

  const { option } = applicationType;
  const generalApplication = claim.generalApplication;

  switch (option) {
    case ApplicationTypeOption.SETTLE_BY_CONSENT:
    case ApplicationTypeOption.SET_ASIDE_JUDGEMENT:
      delete generalApplication['informOtherParties'];
      break;
    case ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT:
      delete generalApplication['requestingReasons'];
      delete generalApplication['orderJudges'];
      delete generalApplication['informOtherParties'];
      delete generalApplication['applicationCosts'];
      break;
  }

  if (option !== ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) {
    delete generalApplication['uploadN245Form'];
  }
};

