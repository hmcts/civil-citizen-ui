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
const fileUpload = 'fileUpload';

export const buildTrialCaseSummarySection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialCaseSummary}[${trialCaseSummary}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY', null, 'govuk-!-width-three-quarters')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialCaseSummary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, trialCaseSummary), section?.caseDocument)
    .addRemoveSectionButton(form?.model.trialCaseSummary?.length > 1 || false)
    .build();
};

export const buildTrialSkeletonSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialSkeletonArgument}[${trialSkeletonArgument}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON', null, 'govuk-!-width-three-quarters')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialSkeletonArgument, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, trialSkeletonArgument), section?.caseDocument)
    .addRemoveSectionButton(form?.model.trialSkeletonArgument?.length > 1 || false)
    .build();
};

export const buildTrialLegalSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialAuthorities}[${trialAuthorities}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL', null, 'govuk-!-width-three-quarters')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialAuthorities, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, trialAuthorities), section?.caseDocument)
    .addRemoveSectionButton(form?.model.trialAuthorities?.length > 1 || false)
    .build();
};

export const buildTrialCostSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialCosts}[${trialCosts}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS', null, 'govuk-!-width-three-quarters')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialCosts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, trialCosts), section?.caseDocument)
    .addRemoveSectionButton(form?.model.trialCosts?.length > 1 || false)
    .build();
};

export const buildTrialDocumentarySection = (isSmallClaims:boolean, section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialDocumentary}[${trialDocumentary}][${index}]`;
  const missingInputError = form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, trialDocumentary) !== undefined ? 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT' : null;
  const hearingOrTrialTitle = isSmallClaims? 'PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY' : 'PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY';

  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, trialDocumentary),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, trialDocumentary),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, trialDocumentary),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, trialDocumentary),
  };

  return new UploadDocumentsSectionBuilder()
    .addTitle(hearingOrTrialTitle, null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', trialDocumentary, 'typeOfDocument', section?.typeOfDocument, index, missingInputError)
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', trialDocumentary, 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialDocumentary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, trialDocumentary), section?.caseDocument)
    .addRemoveSectionButton(form?.model.trialDocumentary?.length > 1 || false)
    .build();
};
