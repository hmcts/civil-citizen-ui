import {Claim, PreTranslationDocumentType} from 'models/claim';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';
import {
  APPLY_HELP_WITH_FEES_START,
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CASE_DOCUMENT_VIEW_URL,
  CCJ_DEFENDANT_DOB_URL,
  CCJ_PAID_AMOUNT_URL,
  CCJ_REPAYMENT_PLAN_CLAIMANT_URL,
  CCJ_REPAYMENT_PLAN_DEFENDANT_URL,
  CITIZEN_CONTACT_THEM_URL,
  BUNDLES_URL,
  CLAIM_FEE_BREAKUP,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  DASHBOARD_NOTIFICATION_REDIRECT,
  DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT,
  DATE_PAID_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  MEDIATION_SERVICE_EXTERNAL,
  PAY_HEARING_FEE_URL,
  VIEW_DEFENDANT_INFO,
  VIEW_CLAIMANT_INFO,
  VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,
  START_MEDIATION_UPLOAD_FILES,
  VIEW_THE_HEARING_URL,
  CLAIM_DETAILS_URL,
  VIEW_RESPONSE_TO_CLAIM,
  UPLOAD_YOUR_DOCUMENTS_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
  REQUEST_FOR_RECONSIDERATION_URL,
  VIEW_MEDIATION_DOCUMENTS,
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
  APPLICATION_TYPE_URL,
  GA_APPLICATION_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_COMMENTS_URL,
  GA_APPLICATION_RESPONSE_SUMMARY_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_VIEW_APPLICATION_URL,
  GA_RESPONDENT_INFORMATION_URL,
  MAKE_APPLICATION_TO_COURT,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
  GA_SUBMIT_OFFLINE,
  VIEW_THE_JUDGMENT_URL,
  QM_VIEW_QUERY_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import config from 'config';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import { t } from 'i18next';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {getLng} from 'common/utils/languageToggleUtils';
import {LinKFromValues} from 'models/generalApplication/applicationType';
import {isGaForWelshEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const replaceId = (url: string, claimId: string) => url.replace(':id', claimId);
const caseDocViewUrl = (claimId:string, documentId: string) =>
  CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentId);
const dashboardHomeWithTranslationError = (claim: Claim, claimId: string) =>
  constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL) +
  '?errorAwaitingTranslation';

export const replaceDashboardPlaceholders = async (textToReplace: string, valuesMap: Map<string, string>): Promise<string> => {
  valuesMap.forEach((value: string, key: string) => {
    textToReplace = textToReplace?.replace(key, value);
  });
  return textToReplace;
};

function getRedirectUrlForViewHearing(claim: Claim, claimId: string) {
  if (claim?.preTranslationDocumentType === PreTranslationDocumentType.HEARING_NOTICE) {
    return dashboardHomeWithTranslationError(claim, claimId);
  }
  return replaceId(VIEW_THE_HEARING_URL, claimId);
}

export const populateDashboardValues = async (claim: Claim, claimId: string, fullAdmitPayImmediatelyPaymentAmount: string, notification?: DashboardNotification, lng?: string, appId?: string): Promise<Map<string, string>> => {

  const valuesMap: Map<string, string> = new Map<string, string>();
  const daysLeftToRespond = claim?.respondent1ResponseDeadline ? getNumberOfDaysBetweenTwoDays(new Date(), claim.respondent1ResponseDeadline).toString() : '';
  const enforceJudgementUrl = config.get<string>('services.enforceJudgment.url');
  const applyForCertificate = config.get<string>('services.applyForCertificate.url');
  const civilMoneyClaimsTelephone = config.get<string>('services.civilMoneyClaims.telephone');
  const civilMoneyClaimsTelephoneWelshSpeaker = config.get<string>('services.civilMoneyClaims.welshspeaker.telephone');
  const cmcCourtEmailId = config.get<string>('services.civilMoneyClaims.courtEmailId');
  const claimantRequirements = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  const notificationId = notification?.id;
  const welshGaEnabled = await isGaForWelshEnabled();
  valuesMap.set('{VIEW_CLAIM_URL}', replaceId(CLAIM_DETAILS_URL, claimId));
  valuesMap.set('{VIEW_INFO_ABOUT_CLAIMANT}', replaceId(VIEW_CLAIMANT_INFO, claimId));
  valuesMap.set('{VIEW_RESPONSE_TO_CLAIM}', replaceId(VIEW_RESPONSE_TO_CLAIM, claimId));
  valuesMap.set('{VIEW_INFO_ABOUT_DEFENDANT}', replaceId(VIEW_DEFENDANT_INFO, claimId));
  valuesMap.set('{VIEW_HEARINGS}', replaceId(getRedirectUrlForViewHearing(claim,claimId), claimId));
  valuesMap.set('{VIEW_THE_HEARING_URL}', replaceId( getRedirectUrlForViewHearing(claim, claimId), claimId));
  valuesMap.set('{UPLOAD_HEARING_DOCUMENTS}', replaceId(UPLOAD_YOUR_DOCUMENTS_URL, claimId));
  valuesMap.set('{ADD_TRIAL_ARRANGEMENTS}', replaceId(CP_FINALISE_TRIAL_ARRANGEMENTS_URL, claimId));
  valuesMap.set('{PAY_HEARING_FEE}', replaceId(PAY_HEARING_FEE_URL, claimId));
  valuesMap.set('{VIEW_BUNDLE}', replaceId(BUNDLES_URL, claimId));
  valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', replaceId(VIEW_ORDERS_AND_NOTICES_URL, claimId));
  valuesMap.set('{VIEW_JUDGEMENT}', replaceId(VIEW_THE_JUDGMENT_URL, claimId));
  valuesMap.set('{VIEW_APPLICATIONS}', '#');
  valuesMap.set('{VIEW_HEARING_NOTICE}', getHearingDocumentsCaseDocumentIdByType(claim?.caseProgressionHearing?.hearingDocuments, DocumentType.HEARING_FORM)
    ? caseDocViewUrl(claimId, getHearingDocumentsCaseDocumentIdByType(claim?.caseProgressionHearing?.hearingDocuments, DocumentType.HEARING_FORM))
    : dashboardHomeWithTranslationError(claim, claimId));
  valuesMap.set('{VIEW_DEFENDANT_HEARING_REQS}', caseDocViewUrl(claimId, getDQDocumentId(claim,DirectionQuestionnaireType.DEFENDANT)));
  valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS}', caseDocViewUrl(claimId, getDQDocumentId(claim,DirectionQuestionnaireType.CLAIMANT)));
  valuesMap.set('{VIEW_SETTLEMENT_AGREEMENT}', caseDocViewUrl(claimId, getSettlementAgreementDocumentId(claim)));
  valuesMap.set('{DRAFT_CLAIM_TASK_LIST}', '/claim/task-list');
  valuesMap.set('{CLAIM_FEE_URL}', replaceId(CLAIM_FEE_BREAKUP,claimId));
  valuesMap.set('{RESPONSE_TASK_LIST_URL}', replaceId(BILINGUAL_LANGUAGE_PREFERENCE_URL,claimId));
  valuesMap.set('{REQUEST_CCJ_URL}', replaceId(CCJ_DEFENDANT_DOB_URL,claimId));
  valuesMap.set('{COUNTY_COURT_JUDGEMENT_URL}', replaceId(CCJ_PAID_AMOUNT_URL,claimId));
  valuesMap.set('{VIEW_REPAYMENT_PLAN}', replaceId(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,claimId));
  valuesMap.set('{CLAIMANT_RESPONSE_TASK_LIST}', replaceId(CLAIMANT_RESPONSE_TASK_LIST_URL,claimId));
  valuesMap.set('{VIEW_AND_RESPOND}', replaceId(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,claimId));
  valuesMap.set('{daysLeftToRespond}', daysLeftToRespond);
  valuesMap.set('{CCJ_REPAYMENT_PLAN_DEFENDANT_URL}', replaceId(CCJ_REPAYMENT_PLAN_DEFENDANT_URL,claimId));
  valuesMap.set('{CITIZEN_CONTACT_THEM_URL}', replaceId(CITIZEN_CONTACT_THEM_URL,claimId));
  valuesMap.set('{APPLY_FOR_CERTIFICATE}', applyForCertificate);
  valuesMap.set('{enforceJudgementUrl}', enforceJudgementUrl);
  valuesMap.set('{civilMoneyClaimsTelephone}', civilMoneyClaimsTelephone);
  valuesMap.set('{civilMoneyClaimsTelephoneWelshSpeaker}', civilMoneyClaimsTelephoneWelshSpeaker);
  valuesMap.set('{cmcCourtEmailId}', cmcCourtEmailId);
  valuesMap.set('{cmcCourtAddress}', getSendFinancialDetailsAddress(getLng(lng)));
  valuesMap.set('{fullAdmitPayImmediatelyPaymentAmount}', fullAdmitPayImmediatelyPaymentAmount);
  valuesMap.set('{TELL_US_IT_IS_SETTLED}', replaceId(DATE_PAID_URL,claimId));
  valuesMap.set('{DOWNLOAD_SETTLEMENT_AGREEMENT}', caseDocViewUrl(claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT)));
  valuesMap.set('{MEDIATION}', MEDIATION_SERVICE_EXTERNAL);
  valuesMap.set('{MEDIATION_SUCCESSFUL_URL}', caseDocViewUrl(claimId, documentIdExtractor(claim?.mediationAgreement?.document?.document_binary_url)));
  valuesMap.set('{HEARING_DUE_DATE}', claim?.caseProgressionHearing?.hearingDate? claim.bundleStitchingDeadline: '');
  valuesMap.set('{APPLY_HELP_WITH_FEES_START}', replaceId(APPLY_HELP_WITH_FEES_START,claimId));
  valuesMap.set('{VIEW_CCJ_REPAYMENT_PLAN_CLAIMANT}', replaceId(CCJ_REPAYMENT_PLAN_CLAIMANT_URL,claimId));
  valuesMap.set('{VIEW_MEDIATION_SETTLEMENT_AGREEMENT}', replaceId(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,claimId));
  valuesMap.set('{UPLOAD_MEDIATION_DOCUMENTS}', replaceId(START_MEDIATION_UPLOAD_FILES,claimId));
  valuesMap.set('{VIEW_EVIDENCE_UPLOAD_DOCUMENTS}', replaceId(EVIDENCE_UPLOAD_DOCUMENTS_URL,claimId));
  valuesMap.set('{REQUEST_FOR_RECONSIDERATION}', replaceId(REQUEST_FOR_RECONSIDERATION_URL,claimId));
  valuesMap.set('{REQUEST_FOR_RECONSIDERATION_COMMENTS}', replaceId(REQUEST_FOR_RECONSIDERATION_COMMENTS_URL,claimId));
  valuesMap.set('{VIEW_SDO_DOCUMENT}', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SDO_ORDER)
    ? caseDocViewUrl(claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SDO_ORDER))
    : dashboardHomeWithTranslationError(claim, claimId));
  valuesMap.set('{GENERAL_APPLICATIONS_INITIATION_PAGE_URL}', (claim.isAnyPartyBilingual() && !welshGaEnabled) ? replaceId(GA_SUBMIT_OFFLINE, claimId) : replaceId(APPLICATION_TYPE_URL, claimId) + `?linkFrom=${LinKFromValues.start}`);
  valuesMap.set('{VIEW_MEDIATION_DOCUMENTS}', replaceId(VIEW_MEDIATION_DOCUMENTS,claimId));
  valuesMap.set('{CONFIRM_YOU_HAVE_BEEN_PAID_URL}', replaceId(CONFIRM_YOU_HAVE_BEEN_PAID_URL,claimId));
  valuesMap.set('{VIEW_REQUEST_FOR_RECONSIDERATION_DOCUMENT}', caseDocViewUrl(claimId, documentIdExtractor(getRequestForReconsiderationDocument(claim))));
  valuesMap.set('{GENERAL_APPLICATIONS_APPLICATION_SUMMARY_URL}', replaceId(GA_APPLICATION_SUMMARY_URL,claimId));
  valuesMap.set('{GENERAL_APPLICATIONS_RESPONSE_APPLICATION_SUMMARY_URL}', replaceId(GA_APPLICATION_RESPONSE_SUMMARY_URL,claimId));
  valuesMap.set('{GENERAL_APPLICATION_FEE_URL}', replaceId(GA_APPLY_HELP_WITH_FEE_SELECTION,claimId).replace(':appId', appId));
  valuesMap.set('{GA_VIEW_APPLICATION_URL}', replaceId(GA_VIEW_APPLICATION_URL,claimId).replace(':appId', appId));
  valuesMap.set('{GA_RESPONSE_VIEW_APPLICATION_URL}', replaceId(GA_RESPONSE_VIEW_APPLICATION_URL,claimId).replace(':appId', appId));
  valuesMap.set('{GA_RESPONDENT_INFORMATION_URL}', replaceId(GA_RESPONDENT_INFORMATION_URL,claimId).replace(':appId', appId));
  valuesMap.set('{VIEW_COSC_CERTIFICATE_URL}', caseDocViewUrl(claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.CERTIFICATE_OF_DEBT_PAYMENT)));
  valuesMap.set('{MAKE_APPLICATION_TO_COURT_URL}', MAKE_APPLICATION_TO_COURT);
  valuesMap.set('{COMFIRM_YOU_PAID_JUDGMENT_DEBT}', replaceId(GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,claimId));
  valuesMap.set('{NOTICE_OF_DISCONTINUANCE}', caseDocViewUrl(claimId, documentIdExtractor(claim?.respondent1NoticeOfDiscontinueAllPartyViewDoc?.documentLink?.document_binary_url)));
  valuesMap.set('{QM_VIEW_MESSAGES_URL}', replaceId(QM_VIEW_QUERY_URL,claimId));

  if (claimantRequirements) {
    valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS_SIZE}', displayDocumentSizeInKB(claimantRequirements.documentSize));
  }
  //Example of how to record click + open a document (target="_blank" will need adding in database <a> element)
  //Rest of the code example in: src/main/routes/features/dashboard/notificationRedirectController.ts
  if(notificationId){
    //TODO: Example case for draft claim - can be removed once a real view document is added.
    valuesMap.set('{VIEW_BUNDLE_REDIRECT}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'VIEW_BUNDLE')
      .replace(':notificationId', notificationId));
    valuesMap.set('{VIEW_ORDERS_AND_NOTICES_REDIRECT}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
      .replace(':notificationId', notificationId));

    valuesMap.set('{VIEW_HEARING_NOTICE_CLICK}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'VIEW_HEARING_NOTICE')
      .replace(':notificationId', notificationId));

    valuesMap.set('{PAY_HEARING_FEE_URL_REDIRECT}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'PAY_HEARING_FEE_URL')
      .replace(':notificationId', notificationId));
    const documentId = getDocumentIdFromParams(notification);
    const hiddenDocumentId = getHiddenDocumentIdFromParams(notification);
    let extractedDocumentId: string;
    if (hiddenDocumentId?.length > 0 && hiddenDocumentNowVisible(hiddenDocumentId, claim)) {
      extractedDocumentId = documentIdExtractor(hiddenDocumentId);
    } else {
      extractedDocumentId = documentId?.length > 0 ? documentIdExtractor(documentId) : 'awaiting-translation';
    }
    valuesMap.set('{VIEW_FINAL_ORDER}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, claimId)
      .replace(':locationName', 'VIEW_FINAL_ORDER')
      .replace(':notificationId', notificationId)
      .replace(':documentId', extractedDocumentId));

    valuesMap.set('{VIEW_DECISION_RECONSIDERATION}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'VIEW_DECISION_RECONSIDERATION')
      .replace(':notificationId', notificationId));

    valuesMap.set('{QM_VIEW_MESSAGES_URL_CLICK}', replaceId(DASHBOARD_NOTIFICATION_REDIRECT, claimId)
      .replace(':locationName', 'QM_VIEW_MESSAGES_URL_CLICK')
      .replace(':notificationId', notificationId));
  }

  return valuesMap;
};

function getDQDocumentId(claim:Claim, claimType:DirectionQuestionnaireType) : string {
  return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DIRECTIONS_QUESTIONNAIRE, claimType);
}

function getSettlementAgreementDocumentId(claim:Claim) : string {
  return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT, 'claimant');
}

function getSendFinancialDetailsAddress(lng: string) : string {
  return `<p class='govuk-body'>${t('COMMON.POSTAL_ADDRESS.BUILDING', {lng})}<br>
    ${t('COMMON.POSTAL_ADDRESS.PO_BOX', {lng})}<br>
    ${t('COMMON.POSTAL_ADDRESS.CITY', {lng})}<br>
    ${t('COMMON.POSTAL_ADDRESS.POSTCODE', {lng})}</p>`;
}

function getDocumentIdFromParams (notification: DashboardNotification): string {
  return getValueFromParams('orderDocument', notification);
}

function getHiddenDocumentIdFromParams (notification: DashboardNotification): string {
  return getValueFromParams('hiddenOrderDocument', notification);
}

function getValueFromParams (key: string, notification: DashboardNotification): string {
  if (notification?.params) {
    const paramMap: Map<string, object> = objectToMap(notification.params);
    if (paramMap.get(key)) {
      return paramMap.get(key).toString();
    }
  }
  return '';
}

export function objectToMap(obj: any): Map<string, any> {
  const map = new Map<string, any>();

  for (const key in obj) {
    if (key in obj) {
      map.set(key, obj[key]);
    }
  }

  return map;
}

function getRequestForReconsiderationDocument (claim: Claim) {
  if (claim.isClaimant()) {
    return claim?.caseProgression?.requestForReconsiderationDocumentRes?.documentLink.document_binary_url;
  } else {
    return claim?.caseProgression?.requestForReconsiderationDocument?.documentLink.document_binary_url;
  }
}

function hiddenDocumentNowVisible(documentUrl: string, claim: Claim) {
  return claim.systemGeneratedCaseDocuments?.some(
    document => (document.value.documentLink.document_binary_url === documentUrl),
  ) ?? false;
}
