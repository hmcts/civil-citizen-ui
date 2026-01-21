import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  ExpertSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';

const expertReport = 'expertReport';
const expertStatement = 'expertStatement';
const questionsForExperts = 'questionsForExperts';
const answersForExperts = 'answersForExperts';
const fileUpload = 'fileUpload';

export const buildExpertReportSection = (section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertReport}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, expertReport, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', expertReport, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', '', '', expertReport, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertReport, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertReport, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildJointStatementSection = (section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertStatement}[${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`),
  };
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, expertStatement, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES', '', '', expertStatement, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', 'govuk-!-width-three-half', '', expertStatement, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DATE', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertStatement, 'date', section?.dateInputFields?.dateDay?.toString(), section?.dateInputFields?.dateMonth?.toString(), section?.dateInputFields?.dateYear?.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertStatement, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildQuestionsForOtherSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${questionsForExperts}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, questionsForExperts, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', questionsForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, questionsForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '', '', questionsForExperts, 'questionDocumentName', section?.questionDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[questionDocumentName]`))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', questionsForExperts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};

export const buildAnswersToQuestionsSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${answersForExperts}[${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addSubTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS', null, 'govuk-!-width-three-quarters govuk-!-display-inline-block')
    .addRemoveSectionButton(true, answersForExperts, index, 'govuk-button govuk-button--secondary govuk-!-display-inline govuk-!-margin-left-5')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', answersForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, answersForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '', '', answersForExperts, 'otherPartyQuestionsDocumentName', section?.otherPartyQuestionsDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyQuestionsDocumentName]`))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', answersForExperts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`), section?.caseDocument)
    .build();
};
