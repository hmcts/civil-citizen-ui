import {
  ApplicationTypeOption,
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
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
  const applicationType = t(getApplicationTypeOptionByTypeAndDescription(getLast(generalAppTypes),ApplicationTypeOptionSelection.BY_APPLICATION_TYPE ), {lng: getLng(lng)}).toLowerCase();
  return t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO',
    { lng: getLng(lng), interpolation: { escapeValue: false }, applicationType});
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

export const saveRespondentStatementOfTruth = async (redisKey: string, statementOfTruth: StatementOfTruthForm): Promise<void> => {
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

export const hideGAAppAsRespondentForClaimant = (application: ApplicationResponse): boolean => {
  return ((application.case_data?.applicationIsCloaked === YesNoUpperCamelCase.NO
        || application.case_data?.applicationIsUncloakedOnce === YesNoUpperCamelCase.YES)
      && application.state !== ApplicationState.APPLICATION_ADD_PAYMENT)
    || (application.case_data?.judicialDecisionRequestMoreInfo?.requestMoreInfoOption === JudicialDecisionRequestMoreInfoOptions.SEND_APP_TO_OTHER_PARTY
      && application.case_data?.generalAppPBADetails?.additionalPaymentDetails?.status === 'SUCCESS');
};

export const buildRespondentApplicationSummaryRow = (claimId: string, lng:string, ccdClaim: Claim) => (application: ApplicationResponse, index: number): ApplicationSummary => {
  const isApplicant = application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO;
  const status = getApplicationStatus(isApplicant, application.state);
  const createDate = getApplicationCreatedDate(ccdClaim, application.id);
  return {
    state: t(`PAGES.GENERAL_APPLICATION.SUMMARY.STATES.${application.state}`, {lng}),
    status: t(`PAGES.GENERAL_APPLICATION.SUMMARY.${status}`, {lng}),
    statusColor: StatusColor[status],
    types: application.case_data?.applicationTypes,
    id: application.id,
    createdDate: dateTimeFormat(createDate, lng),
    applicationUrl: getViewApplicationUrl(claimId, ccdClaim, application, index),
  };
};
