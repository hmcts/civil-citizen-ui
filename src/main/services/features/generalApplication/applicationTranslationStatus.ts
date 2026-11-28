import {ApplicationResponse, TranslationDocumentType} from 'models/generalApplication/applicationResponse';

export const translationInProgressLabel = 'PAGES.GENERAL_APPLICATION.SUMMARY.TRANSLATION_IN_PROGRESS';

const translatedDocumentWorkflows = new Set([
  'UPLOAD_TRANSLATED_DOCUMENT_FOR_FREE_FEE_APPLICATION',
  'UPLOAD_TRANSLATED_DOCUMENT_GA_SUMMARY_DOC',
  'UPLOAD_TRANSLATED_DOCUMENT_GA_SUMMARY_RESPONSE_DOC',
  'UPLOAD_TRANSLATED_DOCUMENT_HEARING_SCHEDULED',
  'UPLOAD_TRANSLATED_DOCUMENT_JUDGE_DECISION',
  'UPLOAD_TRANSLATED_DOCUMENT_FINAL_ORDER',
  'UPLOAD_TRANSLATED_DOCUMENT_GA_LIP',
]);

export function isApplicationTranslationInProgress(application: ApplicationResponse): boolean {
  const documentType = application.case_data?.preTranslationGaDocumentType;
  if (Object.values(TranslationDocumentType).includes(documentType)) {
    return true;
  }

  // Upload clears the document type before the follow-on workflow completes.
  const process = application.case_data?.businessProcess;
  return translatedDocumentWorkflows.has(process?.camundaEvent)
    && (process.status === 'READY' || process.status === 'DISPATCHED' || process.status === 'STARTED');
}
