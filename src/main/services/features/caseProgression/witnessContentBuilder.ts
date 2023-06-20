import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

const witnessStatement = 'witnessStatement';
const witnessSummary = 'witnessSummary';
const noticeOfIntention = 'noticeOfIntention';
const documentsReferred = 'documentsReferred';

const fileUpload = 'file_upload';

export const buildWitnessStatement = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessStatement}[${witnessStatement}][${index}]`;
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessStatement) : '';
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessStatement) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessStatement) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessStatement) : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessStatement, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, witnessStatement))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessStatement, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessStatement, fileUpload)
    .addRemoveSectionButton(form?.model.witnessStatement?.length > 1 || false)
    .build();
};

export const buildWitnessSummary = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessSummary}[${witnessSummary}][${index}]`;
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessSummary) : '';
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessSummary) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessSummary) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessSummary) : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessSummary, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, witnessSummary))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessSummary, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessSummary, fileUpload)
    .addRemoveSectionButton(form?.model.witnessSummary?.length > 1 || false)
    .build();
};

export const buildNoticeOfIntention = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${noticeOfIntention}[${noticeOfIntention}][${index}]`;
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, noticeOfIntention) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, noticeOfIntention) : '';
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, noticeOfIntention) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, noticeOfIntention) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, noticeOfIntention) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, noticeOfIntention) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, noticeOfIntention) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, noticeOfIntention) : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', noticeOfIntention, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, noticeOfIntention))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfIntention, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', noticeOfIntention, fileUpload, index)
    .addRemoveSectionButton(form?.model.noticeOfIntention?.length > 1 || false)
    .build();
};

export const buildDocumentsReferred = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsReferred}[${documentsReferred}][${index}]`;
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, documentsReferred) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, documentsReferred) : '';
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, documentsReferred) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, documentsReferred) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, documentsReferred) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, documentsReferred) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, documentsReferred) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, documentsReferred) : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', documentsReferred, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsReferred))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsReferred, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsReferred, fileUpload, index)
    .addRemoveSectionButton(form?.model.documentsReferred?.length > 1 || false)
    .build();
};
