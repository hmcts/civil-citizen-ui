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

const fileUpload = 'fileUpload';

export const buildWitnessStatement = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessStatement}[${witnessStatement}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessStatement),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessStatement),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessStatement),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessStatement),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessStatement, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, witnessStatement))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessStatement, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessStatement, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, witnessStatement))
    .addRemoveSectionButton(form?.model.witnessStatement?.length > 1 || false)
    .build();
};

export const buildWitnessSummary = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${witnessSummary}[${witnessSummary}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, witnessSummary),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, witnessSummary),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, witnessSummary),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[date]`, witnessSummary),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', witnessSummary, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, witnessSummary))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessSummary, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessSummary, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, witnessSummary))
    .addRemoveSectionButton(form?.model.witnessSummary?.length > 1 || false)
    .build();
};

export const buildNoticeOfIntention = (section: WitnessSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${noticeOfIntention}[${noticeOfIntention}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, noticeOfIntention),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, noticeOfIntention),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, noticeOfIntention),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[date]`, noticeOfIntention),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', '', '', noticeOfIntention, 'witnessName', section?.witnessName, index, form?.errorFor(`${errorFieldNamePrefix}[witnessName]`, noticeOfIntention))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfIntention, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', noticeOfIntention, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, noticeOfIntention))
    .addRemoveSectionButton(form?.model.noticeOfIntention?.length > 1 || false)
    .build();
};

export const buildDocumentsReferred = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${documentsReferred}[${documentsReferred}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, documentsReferred),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, documentsReferred),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, documentsReferred),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[date]`, documentsReferred),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', '', 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', documentsReferred, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, documentsReferred))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsReferred, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsReferred, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, documentsReferred))
    .addRemoveSectionButton(form?.model.documentsReferred?.length > 1 || false)
    .build();
};
