import {
  ApplicationTypeOption,
} from 'common/models/generalApplication/applicationType';
import { YesNo, YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { t } from 'i18next';
import { getLng } from 'common/utils/languageToggleUtils';
import { HearingArrangement } from 'models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'models/generalApplication/hearingContactDetails';
import { HearingSupport } from 'models/generalApplication/hearingSupport';
import { UnavailableDatesGaHearing } from 'models/generalApplication/unavailableDatesGaHearing';
import {
  getApplicationCreatedDate,
  getApplicationStatus,
  getLast,
  getViewApplicationUrl,
} from 'services/features/generalApplication/generalApplicationService';
import { StatementOfTruthForm } from 'common/models/generalApplication/statementOfTruthForm';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from './generalApplicationResponseStoreService';
import {
  ApplicationResponse,
  JudicialDecisionRequestMoreInfoOptions,
} from 'common/models/generalApplication/applicationResponse';
import {
  ApplicationState,
  ApplicationSummary,
  StatusColor,
} from 'common/models/generalApplication/applicationSummary';
import { dateTimeFormat } from 'common/utils/dateUtils';
import { Claim } from 'models/claim';
import {displayToEnumKey} from 'services/translation/convertToCUI/cuiTranslation';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const saveRespondentAgreeToOrder = async (redisKey: string, agreeToOrder: YesNo): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    if (agreeToOrder === YesNo.YES) {
      gaResponse.respondentAgreement = undefined;
    }
    gaResponse.agreeToOrder = agreeToOrder;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export function getRespondToApplicationCaption(generalAppTypes: ApplicationTypeOption[], lng: string): string {
  if (generalAppTypes?.length > 1) {
    return t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO_MULTIPLE', { lng: getLng(lng) });
  }
  const applicationType = getLast(generalAppTypes);
  return t(`PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO.${applicationType}`,{ lng: getLng(lng) });
}

export function getUnavailableHearingDateCaption(lng: string): string {
  return t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE', { lng: getLng(lng) });
}

export function getHearingSupportCaption(lng: string): string {
  return t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE', { lng: getLng(lng) });
}

export const saveRespondentHearingArrangement = async (redisKey: string, hearingArrangement: HearingArrangement): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.hearingArrangement = hearingArrangement;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentHearingContactDetails = async (redisKey: string, hearingContactDetails: HearingContactDetails): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.hearingContactDetails = hearingContactDetails;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentHearingSupport = async (redisKey: string, hearingSupport: HearingSupport): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.hearingSupport = hearingSupport;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentUnavailableDates = async (redisKey: string, unavailableDates: UnavailableDatesGaHearing): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    while (unavailableDates?.items?.length > 0 && !unavailableDates.items[unavailableDates.items.length - 1].type) {
      unavailableDates?.items.pop();
    }
    gaResponse.unavailableDatesHearing = unavailableDates;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveResponseUnavailabilityDatesConfirmation = async (redisKey: string, hasUnavailableDatesHearing: YesNo): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.hasUnavailableDatesHearing = hasUnavailableDatesHearing;
    if (hasUnavailableDatesHearing === YesNo.NO) {
      delete gaResponse.unavailableDatesHearing;
    }
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentStatementOfTruth = async (redisKey: string, statementOfTruth: StatementOfTruthForm | QualifiedStatementOfTruth): Promise<void> => {
  try {
    const gaResponse = await getDraftGARespondentResponse(redisKey);
    gaResponse.statementOfTruth = statementOfTruth;
    await saveDraftGARespondentResponse(redisKey, gaResponse);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const isApplicationVisibleToRespondent = (application: ApplicationResponse): boolean => {
  return isApplicationFullyVisibleToRespondent(application)
    || (application.case_data?.judicialDecision && (application.state !== ApplicationState.APPLICATION_ADD_PAYMENT));
};

export const isApplicationFullyVisibleToRespondent = (application: ApplicationResponse): boolean => {
  const parentClaimantIsApplicant = application.case_data?.parentClaimantIsApplicant;
  const isWithNotice = application.case_data?.generalAppInformOtherParty?.isWithNotice;
  return ((parentClaimantIsApplicant === YesNoUpperCamelCase.YES && isWithNotice === YesNoUpperCamelCase.YES)
    || (parentClaimantIsApplicant === YesNoUpperCamelCase.NO)
    || (application.case_data?.generalAppRespondentAgreement?.hasAgreed === YesNoUpperCamelCase.YES)
    || ((application.case_data?.applicationIsCloaked === YesNoUpperCamelCase.NO
        || application.case_data?.applicationIsUncloakedOnce === YesNoUpperCamelCase.YES)
      && application.state !== ApplicationState.APPLICATION_ADD_PAYMENT)
    || (application.case_data?.judicialDecisionRequestMoreInfo?.requestMoreInfoOption === JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY
      && application.case_data?.generalAppPBADetails?.additionalPaymentDetails?.status === 'SUCCESS')
  );
};

export const isApplicationVisibleToRespondentForClaimant = (application: ApplicationResponse): boolean => {
  return isApplicationFullyVisibleToRespondentForClaimant(application)
  || (application.case_data?.judicialDecision && (application.state !== ApplicationState.APPLICATION_ADD_PAYMENT));
};

export const isApplicationFullyVisibleToRespondentForClaimant = (application: ApplicationResponse): boolean => {
  const parentClaimantIsApplicant = application.case_data.parentClaimantIsApplicant;
  const isWithNotice = application.case_data?.generalAppInformOtherParty?.isWithNotice;
  return ((parentClaimantIsApplicant === YesNoUpperCamelCase.NO && isWithNotice === YesNoUpperCamelCase.YES)
    || (parentClaimantIsApplicant === YesNoUpperCamelCase.YES)
    || (application.case_data?.generalAppRespondentAgreement?.hasAgreed === YesNoUpperCamelCase.YES)
    || ((application.case_data?.applicationIsCloaked === YesNoUpperCamelCase.NO
        || application.case_data?.applicationIsUncloakedOnce === YesNoUpperCamelCase.YES)
      && application.state !== ApplicationState.APPLICATION_ADD_PAYMENT)
    || (application.case_data?.judicialDecisionRequestMoreInfo?.requestMoreInfoOption === JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY
      && application.case_data?.generalAppPBADetails?.additionalPaymentDetails?.status === 'SUCCESS')
    || (displayToEnumKey(application.case_data.applicationTypes) === 'CONFIRM_CCJ_DEBT_PAID')
  );
};

export const hideGAAppAsRespondentForClaimant = (application: ApplicationResponse): boolean => {
  const applicationIsCloaked = application.case_data?.applicationIsCloaked === YesNoUpperCamelCase.NO || application.case_data?.applicationIsCloaked === undefined;
  const applicationIsUncloakedOnce = application.case_data?.applicationIsUncloakedOnce === YesNoUpperCamelCase.YES || application.case_data?.applicationIsUncloakedOnce === undefined;

  const isCloakedOrUncloakedOnceValid = (
    (applicationIsCloaked || applicationIsUncloakedOnce) &&
    application.state !== ApplicationState.APPLICATION_ADD_PAYMENT
  );

  const isJudicialDecisionValid = (
    application.case_data?.judicialDecisionRequestMoreInfo?.requestMoreInfoOption === JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY
    && application.case_data?.generalAppPBADetails?.additionalPaymentDetails?.status === 'SUCCESS'
  );
  return isCloakedOrUncloakedOnceValid || isJudicialDecisionValid;
};

export const buildRespondentApplicationSummaryRow = (claimId: string, lng:string, ccdClaim: Claim) => (application: ApplicationResponse, index: number): ApplicationSummary => {
  const isApplicant = application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO;
  const status = getApplicationStatus(isApplicant, application.state);
  const createDate = getApplicationCreatedDate(ccdClaim, application.id);
  const type = displayToEnumKey(application.case_data?.applicationTypes);
  let typeString = t(`PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.${type}`, {lng});
  if (application.case_data?.applicationTypes.includes(',')) {
    const types = application.case_data?.applicationTypes.split(',').map((applicationType: string) => displayToEnumKey(applicationType.trim()));
    typeString = types.map(tp => t(`PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.${tp}`, {lng})).join(', ');
  }
  return {
    state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.STATES.${application.state}`, {lng}),
    status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
    statusColor: StatusColor[status],
    types: typeString,
    id: application.id,
    createdDate: dateTimeFormat(createDate, lng),
    applicationUrl: getViewApplicationUrl(claimId, ccdClaim, application, index),
  };
};
