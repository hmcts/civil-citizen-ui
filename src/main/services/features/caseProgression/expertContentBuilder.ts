import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {TypeOfDocumentSection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

const expertReportType = 'expert_report';
const fileUpload = 'file_upload';
const expertJointStatementType = 'expert_report';
const expertQuestionsForOtherType = 'expert_report';
const expertAnswersToQuestionsType = 'expert_report';

export const buildExpertReportSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertReportType}[${expertReportType}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, expertReportType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, expertReportType) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, expertReportType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, expertReportType) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, expertReportType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, expertReportType) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, expertReportType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, expertReportType) : '';
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','govuk-!-width-three-half','',expertReportType,'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE','govuk-!-width-three-half','',expertReportType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError,invalidMonthError,invalidYearError,invalidDateError,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertReportType, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', expertReportType, fileUpload)
    .build();
};

export const buildJointStatementSection = (section: TypeOfDocumentSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertReportType}[${expertReportType}][${index}]`;
  const invalidDayError = form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, expertJointStatementType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateDay]`, expertJointStatementType) : '';
  const invalidMonthError = form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, expertJointStatementType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateMonth]`, expertJointStatementType) : '';
  const invalidYearError = form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, expertJointStatementType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[dateYear]`, expertJointStatementType) : '';
  const invalidDateError = form?.errorFor(`${errorFieldNamePrefix}[date]`, expertJointStatementType) !== undefined ? form?.errorFor(`${errorFieldNamePrefix}[date]`, expertJointStatementType) : '';
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES','govuk-!-width-three-half','',expertJointStatementType,'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE','govuk-!-width-three-half','',expertJointStatementType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_ISSUE_DATE', invalidDayError,invalidMonthError,invalidYearError,invalidDateError,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertJointStatementType, 'date', section?.dateDay.toString(), section?.dateMonth.toString(), section?.dateYear.toString(), index)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', expertJointStatementType, fileUpload)
    .build();
};

export const buildQuestionsForOtherSection = (selectItems: string[]): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER',null,'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','govuk-!-width-three-half','',expertQuestionsForOtherType,'type')
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME','govuk-!-width-three-half','','PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT',selectItems,expertQuestionsForOtherType, 'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU','govuk-!-width-three-half','',expertQuestionsForOtherType,'type')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', expertQuestionsForOtherType, fileUpload)
    .build();
};

export const buildAnswersToQuestionsSection = (selectItems: string[]): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','govuk-!-width-three-half','',expertAnswersToQuestionsType,'type')
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME','govuk-!-width-three-half', '','PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT',selectItems,expertAnswersToQuestionsType,'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH','govuk-!-width-three-half','',expertAnswersToQuestionsType,'type')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', expertAnswersToQuestionsType, fileUpload)
    .build();
};
