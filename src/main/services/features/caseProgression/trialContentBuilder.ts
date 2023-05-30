import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const trialDocumentsType = 'trial_documents';
const fileUpload = 'file_upload';

export const buildTrialCaseSummarySection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialSkeletonSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialLegalSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialCostSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};

export const buildTrialDocumentarySection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT','govuk-!-width-three-half','PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE',trialDocumentsType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', trialDocumentsType)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentsType,
      fileUpload)
    .build();
};
