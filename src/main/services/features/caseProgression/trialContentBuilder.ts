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
  const errorFieldNamePrefix = `${trialCaseSummary}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, trialCaseSummary, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialCaseSummary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildTrialSkeletonSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialSkeletonArgument}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, trialSkeletonArgument, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialSkeletonArgument, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildTrialLegalSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialAuthorities}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, trialAuthorities, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialAuthorities, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildTrialCostSection = (section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialCosts}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, trialCosts, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialCosts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildTrialDocumentarySection = (isSmallClaims:boolean, section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${trialDocumentary}[${index}]`;
  const hearingOrTrialTitle = isSmallClaims? 'PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY' : 'PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY';

  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };

  return new UploadDocumentsSectionBuilder()
    .addSubTitle(hearingOrTrialTitle, null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, trialDocumentary, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', trialDocumentary, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', trialDocumentary, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', trialDocumentary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};
