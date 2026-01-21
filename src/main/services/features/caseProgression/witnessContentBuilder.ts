import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {
  ReferredToInTheStatementSection,
  UploadDocumentsUserForm,
  WitnessSection, WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

const witnessStatement = 'witnessStatement';
const witnessSummary = 'witnessSummary';
const noticeOfIntention = 'noticeOfIntention';
const documentsReferred = 'documentsReferred';

const fileUpload = 'fileUpload';

export const buildWitnessStatement = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessStatement}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, witnessStatement, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessStatement, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessStatement,'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessStatement, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildWitnessSummary = (section: WitnessSummarySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessSummary}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, witnessSummary, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessSummary, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessSummary, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessSummary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildNoticeOfIntention = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${noticeOfIntention}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, noticeOfIntention, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', noticeOfIntention, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfIntention, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', noticeOfIntention, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildDocumentsReferred = (section: ReferredToInTheStatementSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsReferred}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, documentsReferred, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', documentsReferred, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', documentsReferred, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsReferred, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsReferred, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};
