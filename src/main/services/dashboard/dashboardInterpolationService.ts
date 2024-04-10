import {Claim} from 'models/claim';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';
import {
  CCJ_DEFENDANT_DOB_URL,
  CLAIM_FEE_BREAKUP,
  DASHBOARD_NOTIFICATION_REDIRECT,
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CCJ_PAID_AMOUNT_URL,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  CASE_DOCUMENT_VIEW_URL,
  CCJ_REPAYMENT_PLAN_DEFENDANT_URL,
  CITIZEN_CONTACT_THEM_URL,
  MEDIATION_SERVICE_EXTERNAL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  DATE_PAID_URL,
  CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, BUNDLES_URL,
} from 'routes/urls';
import config from 'config';
import { getTotalAmountWithInterestAndFees } from 'modules/claimDetailsService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {documentIdExtractor} from 'common/utils/stringUtils';
import { t } from 'i18next';

export const replaceDashboardPlaceholders = (textToReplace: string, claim: Claim, claimId: string, notificationId?: string): string => {

  const valuesMap = setDashboardValues(claim, claimId, notificationId);
  valuesMap.forEach((value: string, key: string) => {
    textToReplace = textToReplace?.replace(key, value);
  });

  return textToReplace;
};

const setDashboardValues = (claim: Claim, claimId: string, notificationId?: string): Map<string, string> => {

  const valuesMap: Map<string, string> = new Map<string, string>();
  const daysLeftToRespond = claim?.respondent1ResponseDeadline ? getNumberOfDaysBetweenTwoDays(new Date(), claim.respondent1ResponseDeadline).toString() : '';
  const enforceJudgementUrl = config.get<string>('services.enforceJudgment.url');
  const applyForCertificate = config.get<string>('services.applyForCertificate.url');
  const civilMoneyClaimsTelephone = config.get<string>('services.civilMoneyClaims.telephone');
  const cmcCourtEmailId = config.get<string>('services.civilMoneyClaims.courtEmailId');
  const claimantRequirements = claim.getDocumentDetails(DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);

  valuesMap.set('{VIEW_CLAIM_URL}', '#');
  valuesMap.set('{VIEW_INFO_ABOUT_CLAIMANT}', '#');
  valuesMap.set('{VIEW_RESPONSE_TO_CLAIM}', '#');
  valuesMap.set('{VIEW_INFO_ABOUT_DEFENDANT}', '#');
  valuesMap.set('{VIEW_HEARINGS}', '#');
  valuesMap.set('{UPLOAD_HEARING_DOCUMENTS}', '#');
  valuesMap.set('{ADD_TRIAL_ARRANGEMENTS}', '#');
  valuesMap.set('{VIEW_BUNDLE}', BUNDLES_URL.replace(':id', claimId));
  valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', '#');
  valuesMap.set('{VIEW_JUDGEMENT}', '#');
  valuesMap.set('{VIEW_APPLICATIONS}', '#');
  valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getClaimantDQDocumentId(claim)));
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
  valuesMap.set('{cmcCourtEmailId}', cmcCourtEmailId);
  valuesMap.set('{cmcCourtAddress}', getSendFinancialDetailsAddress());
  valuesMap.set('{fullAdmitPayImmediatelyPaymentAmount}', getTotalAmountWithInterestAndFees(claim).toString());
  valuesMap.set('{TELL_US_IT_IS_SETTLED}', DATE_PAID_URL.replace(':id', claimId));
  valuesMap.set('{DOWNLOAD_SETTLEMENT_AGREEMENT}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SETTLEMENT_AGREEMENT)));
  valuesMap.set('{MEDIATION}', MEDIATION_SERVICE_EXTERNAL);
  valuesMap.set('{MEDIATION_SUCCESSFUL_URL}', CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(claim?.mediationAgreement?.document?.document_binary_url)));

  if (claimantRequirements) {
    valuesMap.set('{VIEW_CLAIMANT_HEARING_REQS_SIZE}', displayDocumentSizeInKB(claimantRequirements.documentSize));
  }
  //Example of how to record click + open a document (target="_blank" will need adding in database <a> element)
  //Rest of the code example in: src/main/routes/features/dashboard/notificationRedirectController.ts
  if(notificationId){
    //TODO: Example case for draft claim - can be removed once a real view document is added.
    valuesMap.set('{VIEW_DOCUMENT_DRAFT}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_DOCUMENT_DRAFT')
      .replace(':notificationId', notificationId));
  }

  return valuesMap;
};

function getClaimantDQDocumentId(claim:Claim) : string {
  return getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DIRECTIONS_QUESTIONNAIRE, DirectionQuestionnaireType.CLAIMANT);
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
