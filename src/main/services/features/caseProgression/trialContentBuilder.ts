import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const trialDocumentsType = 'trial_documents';
const fileUpload = 'file_upload';

export const buildTrialCaseSummarySection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialSkeletonSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialLegalSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialCostSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialDocumentarySection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT','govuk-!-width-three-half','PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE',trialDocumentsType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', trialDocumentsType)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};
