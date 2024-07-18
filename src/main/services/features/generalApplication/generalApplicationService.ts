import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {
  ApplicationType,
  ApplicationTypeOption,
  selectedApplicationType,
} from 'common/models/generalApplication/applicationType';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {Claim} from 'models/claim';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {YesNo} from 'common/form/models/yesNo';
import {isCUIReleaseTwoEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ValidationError} from 'class-validator';
import {InformOtherParties} from 'common/models/generalApplication/informOtherParties';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
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
import {GaResponse} from 'common/models/generalApplication/response/gaResponse';
import {ApplicationState, ApplicationStatus} from 'common/models/generalApplication/applicationSummary';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import config from 'config';
import {GaServiceClient} from 'client/gaServiceClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');
const baseUrl: string = config.get<string>('services.generalApplication.url');
const generalApplicationClient = new GaServiceClient(baseUrl);

export const saveApplicationType = async (claimId: string, applicationType: ApplicationType, index?: number): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    updateByIndexOrAppend(claim.generalApplication?.applicationTypes, applicationType, index);
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
    const claim = await getCaseDataFromStore(redisKey);
    const generalApplication = claim.generalApplication || new GeneralApplication();
    claim.generalApplication = {
      ...generalApplication,
      response: {
        ...generalApplication.response,
        respondentAgreement,
      },
    } as GeneralApplication;
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAcceptDefendantOffer = async (redisKey: string, acceptDefendantOffer: AcceptDefendantOffer): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
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
    claim.generalApplication.response.acceptDefendantOffer = Object.assign(new AcceptDefendantOffer(), acceptDefendantOffer);
    await saveDraftClaim(redisKey, claim);
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
  if (claim.isClaimant()) {
    const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
    if (isCUIR2Enabled) {
      return constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    }
    return constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL);
  }
  return constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
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
    ? selectedApplicationType[applicationTypes[0].option]
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

export const saveHelpWithFeesDetails = async (claimId: string, value: any, hwfPropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    if(claim.generalApplication.helpWithFees) {
      claim.generalApplication.helpWithFees[hwfPropertyName] = value;
    } else {
      const helpWithFees: any = new GaHelpWithFees();
      helpWithFees[hwfPropertyName] = value;
      claim.generalApplication.helpWithFees = helpWithFees;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getApplicationStatus = (status: ApplicationState): ApplicationStatus => {
  switch (status) {
    case ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION:
      return ApplicationStatus.IN_PROGRESS;
    case ApplicationState.AWAITING_RESPONDENT_RESPONSE:
      return ApplicationStatus.IN_PROGRESS;
    case ApplicationState.AWAITING_APPLICATION_PAYMENT:
      return ApplicationStatus.TO_DO;
    default:
      return ApplicationStatus.TO_DO;
  }
};

export const getApplicationFromGAService = async (req: AppRequest, applicationId: string): Promise<ApplicationResponse> => {
  return await generalApplicationClient.getApplication(req, applicationId);
};

export const saveRespondentWantToUploadDoc = async (claimId: string, claim: Claim, wantToUploadDocuments: YesNo): Promise<void> => {
  try {
    const generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication = {
      ...generalApplication,
      response: {
        ...generalApplication.response,
        wantToUploadDocuments,
      },
    } as GeneralApplication;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
