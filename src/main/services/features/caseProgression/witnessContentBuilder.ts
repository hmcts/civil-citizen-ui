import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {TypeOfDocumentSection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

const witnessEvidence = 'witness-evidence';
const witnessStatement = witnessEvidence + '-witness-statement';
const witnessSummary = witnessEvidence + '-witness-summary';
const noticeOfHearsayEvidence = witnessEvidence + '-notice';
const documentsInStatement = witnessEvidence + '-documents';

const fileUpload = 'file_upload';
const widthThreeHalfClass = 'govuk-!-width-three-half';

export const buildWitnessStatement = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessStatement}[${witnessStatement}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessStatement) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessStatement) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessStatement) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessStatement) : '';

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', witnessStatement, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessEvidence, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessStatement, fileUpload)
    .build();
};

export const buildWitnessSummary = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessSummary}[${witnessSummary}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessSummary) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessSummary) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessSummary) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessSummary) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessSummary) : '';
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', witnessSummary, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessSummary, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessSummary, fileUpload)
    .build();
};

export const buildNoticeOfHearsayEvidence = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${noticeOfHearsayEvidence}[${noticeOfHearsayEvidence}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, noticeOfHearsayEvidence) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, noticeOfHearsayEvidence) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, noticeOfHearsayEvidence) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, noticeOfHearsayEvidence) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, noticeOfHearsayEvidence) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, noticeOfHearsayEvidence) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, noticeOfHearsayEvidence) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, noticeOfHearsayEvidence) : '';
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', noticeOfHearsayEvidence, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfHearsayEvidence, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', noticeOfHearsayEvidence, fileUpload)
    .build();
};

export const buildDocumentsInStatement = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsInStatement}[${documentsInStatement}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, documentsInStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, documentsInStatement) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, documentsInStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, documentsInStatement) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, documentsInStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, documentsInStatement) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, documentsInStatement) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, documentsInStatement) : '';
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', widthThreeHalfClass, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', documentsInStatement, 'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError, invalidMonthError,invalidYearError,invalidDateError, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfHearsayEvidence, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsInStatement, fileUpload)
    .build();
};
