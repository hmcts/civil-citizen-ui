import {Claim} from 'models/claim';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';
import {CLAIM_FEE_BREAKUP, DASHBOARD_NOTIFICATION_REDIRECT, RESPONSE_TASK_LIST_URL, CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';

export const replaceDashboardPlaceholders = (textToReplace: string, claim: Claim, notificationId?: number): string => {

  const valuesMap = setDashboardValues(claim, notificationId);
  valuesMap.forEach((value: string, key: string) => {
    textToReplace = textToReplace?.replace(key, value);
  });

  return textToReplace;
};

const setDashboardValues = (claim: Claim, notificationId?: number): Map<string, string> => {
  const valuesMap: Map<string, string> = new Map<string, string>();
  const claimId = claim.id;
  const daysLeftToRespond = claim?.respondent1ResponseDeadline ? getNumberOfDaysBetweenTwoDays(new Date(), claim.respondent1ResponseDeadline).toString()  :'';
  const downloadClaimantDQLink = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId',getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments,DocumentType.DIRECTIONS_QUESTIONNAIRE,DirectionQuestionnaireType.CLAIMANT));
  valuesMap.set('{VIEW_CLAIM_URL}', '#');
  valuesMap.set('{VIEW_INFO_ABOUT_CLAIMANT}', '#');
  valuesMap.set('{VIEW_RESPONSE_TO_CLAIM}', '#');
  valuesMap.set('{VIEW_INFO_ABOUT_DEFENDANT}', '#');
  valuesMap.set('{VIEW_HEARINGS}', '#');
  valuesMap.set('{UPLOAD_HEARING_DOCUMENTS}', '#');
  valuesMap.set('{ADD_TRIAL_ARRANGEMENTS}', '#');
  valuesMap.set('{VIEW_BUNDLE}', '#');
  valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', '#');
  valuesMap.set('{VIEW_JUDGEMENT}', '#');
  valuesMap.set('{VIEW_APPLICATIONS}', '#');
  valuesMap.set('{VIEW_CLAIMANT_HEARING_INFO}', downloadClaimantDQLink);
  valuesMap.set('{DRAFT_CLAIM_TASK_LIST}', '/claim/task-list');
  valuesMap.set('{CLAIM_FEE_URL}', CLAIM_FEE_BREAKUP.replace(':id', claimId));
  valuesMap.set('{RESPONSE_TASK_LIST_URL}', RESPONSE_TASK_LIST_URL.replace(':id', claimId));
  valuesMap.set('{daysLeftToRespond}', daysLeftToRespond);

  //Example of how to record click + open a document (target="_blank" will need adding in database <a> element)
  //Rest of the code example in: src/main/routes/features/dashboard/notificationRedirectController.ts
  if(notificationId){
    //TODO: Example case for draft claim - can be removed once a real view document is added.
    valuesMap.set('{VIEW_DOCUMENT_DRAFT}', DASHBOARD_NOTIFICATION_REDIRECT
      .replace(':id', claimId)
      .replace(':locationName', 'VIEW_DOCUMENT_DRAFT')
      .replace(':notificationId', notificationId.toString()));
  }

  return valuesMap;
};
