import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {
  FileOnlySection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

const trialCaseSummary = 'trialCaseSummary';
const trialSkeletonArgument = 'trialSkeletonArgument';
const trialAuthorities = 'trialAuthorities';
const trialCosts = 'trialCosts';
const trialDocumentary = 'trialDocumentary';
const fileUpload = 'file_upload';

export const buildTrialCaseSummarySection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialCaseSummary, fileUpload, index)
    .addRemoveSectionButton(form?.model.trialCaseSummary?.length > 1 || false)
    .build();
};

export const buildTrialSkeletonSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialSkeletonArgument, fileUpload, index)
    .addRemoveSectionButton(form?.model.trialSkeletonArgument?.length > 1 || false)
    .build();
};

export const buildTrialLegalSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialAuthorities, fileUpload, index)
    .addRemoveSectionButton(form?.model.trialAuthorities?.length > 1 || false)
    .build();
};

export const buildTrialCostSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialCosts, fileUpload, index)
    .addRemoveSectionButton(form?.model.trialCosts?.length > 1 || false)
    .build();
};

export const buildTrialDocumentarySection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialDocumentary}[${trialDocumentary}][${index}]`;
  const missingInputError = form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, trialDocumentary) !== undefined ? 'govuk-form-group--error govuk-input--error' : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', missingInputError, 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', trialDocumentary, 'typeOfDocument', section?.typeOfDocument, index)
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', trialDocumentary)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', trialDocumentary, fileUpload, index)
    .addRemoveSectionButton(form?.model.trialDocumentary?.length > 1 || false)
    .build();
};
