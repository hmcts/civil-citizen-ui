import {Claim} from 'models/claim';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';
import {
  APPLY_HELP_WITH_FEES_START,
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CASE_DOCUMENT_VIEW_URL,
  CCJ_DEFENDANT_DOB_URL,
  CCJ_PAID_AMOUNT_URL,
  CCJ_REPAYMENT_PLAN_CLAIMANT_URL,
  CCJ_REPAYMENT_PLAN_DEFENDANT_URL,
  CITIZEN_CONTACT_THEM_URL, BUNDLES_URL,
  CLAIM_FEE_BREAKUP,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  DASHBOARD_NOTIFICATION_REDIRECT, DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT,
  DATE_PAID_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  MEDIATION_SERVICE_EXTERNAL,
  PAY_HEARING_FEE_URL,
  VIEW_DEFENDANT_INFO,
  VIEW_CLAIMANT_INFO,
  VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT,
  START_MEDIATION_UPLOAD_FILES,
  VIEW_THE_HEARING_URL, CLAIM_DETAILS_URL,
  VIEW_RESPONSE_TO_CLAIM,
  UPLOAD_YOUR_DOCUMENTS_URL, NOTICES_AND_ORDERS_URL,
} from 'routes/urls';
import config from 'config';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import { t } from 'i18next';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';

export const replaceDashboardPlaceholders = (textToReplace: string, claim: Claim, claimId: string, notification?: DashboardNotification): string => {

  const valuesMap = setDashboardValues(claim, claimId, notification);
  valuesMap.forEach((value: string, key: string) => {
    textToReplace = textToReplace?.replace(key, value);
  });

  return textToReplace;
};

const setDashboardValues = (claim: Claim, claimId: string, notification?: DashboardNotification): Map<string, string> => {

  const valuesMap: Map<string, string> = new Map<string, string>();
  const daysLeftToRespond = claim?.respondent1ResponseDeadline ? getNumberOfDaysBetweenTwoDays(new Date(), claim.respondent1ResponseDeadline).toString() : '';
  const enforceJudgementUrl = config.get<string>('services.enforceJudgment.url');
  const applyForCertificate = config.get<string>('services.applyForCertificate.url');
  const civilMoneyClaimsTelephone = config.get<string>('services.civilMoneyClaims.telephone');
  const civilMoneyClaimsTelephoneWelshSpeaker = config.get<string>('services.civilMoneyClaims.welshspeaker.telephone');
  const cmcCourtEmailId = config.get<string>('services.civilMoneyClaims.courtEmailId');
  const claimantRequirements = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
  const notificationId = notification?.id;

  valuesMap.set('{VIEW_CLAIM_URL}', CLAIM_DETAILS_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_INFO_ABOUT_CLAIMANT}', VIEW_CLAIMANT_INFO.replace(':id', claimId));
  valuesMap.set('{VIEW_RESPONSE_TO_CLAIM}', VIEW_RESPONSE_TO_CLAIM.replace(':id', claimId));
  valuesMap.set('{VIEW_INFO_ABOUT_DEFENDANT}', VIEW_DEFENDANT_INFO.replace(':id', claimId));
  valuesMap.set('{VIEW_HEARINGS}',VIEW_THE_HEARING_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_THE_HEARING_URL}', VIEW_THE_HEARING_URL.replace(':id', claimId));
  valuesMap.set('{UPLOAD_HEARING_DOCUMENTS}', UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId));
  valuesMap.set('{ADD_TRIAL_ARRANGEMENTS}', CP_FINALISE_TRIAL_ARRANGEMENTS_URL.replace(':id', claimId));
  valuesMap.set('{PAY_HEARING_FEE}', PAY_HEARING_FEE_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_BUNDLE}', BUNDLES_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', NOTICES_AND_ORDERS_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_JUDGEMENT}', '#');
  valuesMap.set('{VIEW_APPLICATIONS}', '#');
  valuesMap.set('{VIEW_HEARING_NOTICE}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getHearingDocumentsCaseDocumentIdByType(claim?.caseProgressionHearing?.hearingDocuments, DocumentType.HEARING_FORM)));
  valuesMap.set('{VIEW_DEFENDANT_HEARING_REQS}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getDQDocumentId(claim,DirectionQuestionnaireType.DEFENDANT)));
  valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getDQDocumentId(claim,DirectionQuestionnaireType.CLAIMANT)));
  valuesMap.set('{VIEW_SETTLEMENT_AGREEMENT}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getSettlementAgreementDocumentId(claim)));
  valuesMap.set('{DRAFT_CLAIM_TASK_LIST}', '/claim/task-list');
  valuesMap.set('{CLAIM_FEE_URL}', CLAIM_FEE_BREAKUP.replace(':id', claimId));
  valuesMap.set('{RESPONSE_TASK_LIST_URL}', BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', claimId));
  valuesMap.set('{REQUEST_CCJ_URL}', CCJ_DEFENDANT_DOB_URL.replace(':id', claimId));
  valuesMap.set('{COUNTY_COURT_JUDGEMENT_URL}', CCJ_PAID_AMOUNT_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_REPAYMENT_PLAN}', DEFENDANT_SIGN_SETTLEMENT_AGREEMENT.replace(':id', claimId));
  valuesMap.set('{CLAIMANT_RESPONSE_TASK_LIST}', CLAIMANT_RESPONSE_TASK_LIST_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_AND_RESPOND}', CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL.replace(':id', claimId));
  valuesMap.set('{daysLeftToRespond}', daysLeftToRespond);
  valuesMap.set('{CCJ_REPAYMENT_PLAN_DEFENDANT_URL}', CCJ_REPAYMENT_PLAN_DEFENDANT_URL.replace(':id', claimId));
  valuesMap.set('{CITIZEN_CONTACT_THEM_URL}', CITIZEN_CONTACT_THEM_URL.replace(':id', claimId));
  valuesMap.set('{APPLY_FOR_CERTIFICATE}', applyForCertificate);
  valuesMap.set('{enforceJudgementUrl}', enforceJudgementUrl);
  valuesMap.set('{civilMoneyClaimsTelephone}', civilMoneyClaimsTelephone);
  valuesMap.set('{civilMoneyClaimsTelephoneWelshSpeaker}', civilMoneyClaimsTelephoneWelshSpeaker);
  valuesMap.set('{cmcCourtEmailId}', cmcCourtEmailId);
  valuesMap.set('{cmcCourtAddress}', getSendFinancialDetailsAddress());
  valuesMap.set('{fullAdmitPayImmediatelyPaymentAmount}', getTotalAmountWithInterestAndFees(claim).toString());
  valuesMap.set('{TELL_US_IT_IS_SETTLED}', DATE_PAID_URL.replace(':id', claimId));
  valuesMap.set('{DOWNLOAD_SETTLEMENT_AGREEMENT}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT)));
  valuesMap.set('{MEDIATION}', MEDIATION_SERVICE_EXTERNAL);
  valuesMap.set('{MEDIATION_SUCCESSFUL_URL}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(claim?.mediationAgreement?.document?.document_binary_url)));
  valuesMap.set('{HEARING_DUE_DATE}', claim?.caseProgressionHearing?.hearingDate? claim.bundleStitchingDeadline: '');
  valuesMap.set('{APPLY_HELP_WITH_FEES_START}', APPLY_HELP_WITH_FEES_START.replace(':id', claimId));
  valuesMap.set('{VIEW_CCJ_REPAYMENT_PLAN_CLAIMANT}', CCJ_REPAYMENT_PLAN_CLAIMANT_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_MEDIATION_SETTLEMENT_AGREEMENT}', VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.replace(':id', claimId));
  valuesMap.set('{UPLOAD_MEDIATION_DOCUMENTS}', START_MEDIATION_UPLOAD_FILES.replace(':id', claimId));

  if (claimantRequirements) {
    valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS_SIZE}', displayDocumentSizeInKB(claimantRequirements.documentSize));
  }
  //Example of how to record click + open a document (target="_blank" will need adding in database <a> element)
  //Rest of the code example in: src/main/routes/features/dashboard/notificationRedirectController.ts
  if(notificationId){
    //TODO: Example case for draft claim - can be removed once a real view document is added.
    valuesMap.set('{VIEW_BUNDLE_REDIRECT}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_BUNDLE')
      .replace(':notificationId', notificationId));
    valuesMap.set('{VIEW_ORDERS_AND_NOTICES_REDIRECT}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
      .replace(':notificationId', notificationId));

    valuesMap.set('{VIEW_HEARING_NOTICE_CLICK}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_HEARING_NOTICE')
      .replace(':notificationId', notificationId));

    valuesMap.set('{PAY_HEARING_FEE_URL_REDIRECT}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'PAY_HEARING_FEE_URL')
      .replace(':notificationId', notificationId));
    const documentId = getDocumentIdFromParams(notification);
    valuesMap.set('{VIEW_FINAL_ORDER}', DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_FINAL_ORDER')
      .replace(':notificationId', notificationId)
      .replace(':documentId', documentIdExtractor(documentId)));

  }

  if (claim.orderDocumentId != undefined) {
    valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(claim?.orderDocumentId) + ' target="_blank"'));
  }

  return valuesMap;
};

function getDQDocumentId(claim:Claim, claimType:DirectionQuestionnaireType) : string {
  return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DIRECTIONS_QUESTIONNAIRE, claimType);
}

function getSettlementAgreementDocumentId(claim:Claim) : string {
  return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT, 'claimant');
}

function getSendFinancialDetailsAddress() : string {
  return `<p class='govuk-body'>${t('COMMON.POSTAL_ADDRESS.BUILDING')}<br>
    ${t('COMMON.POSTAL_ADDRESS.PO_BOX')}<br>
    ${t('COMMON.POSTAL_ADDRESS.CITY')}<br>
    ${t('COMMON.POSTAL_ADDRESS.POSTCODE')}</p>`;
}

function getDocumentIdFromParams (notification: DashboardNotification): string {
  if (notification?.params) {
    const paramMap: Map<string, object> = objectToMap(notification.params);
    if (paramMap.get('orderDocument')) {
      return paramMap.get('orderDocument').toString();
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
