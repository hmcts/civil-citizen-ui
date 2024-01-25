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
  const errorFieldNamePrefix = `${expertReport}[${expertReport}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, expertReport),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, expertReport),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, expertReport),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, expertReport),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', expertReport, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`, expertReport))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', '', '', expertReport, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`, expertReport))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertReport, 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index,'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertReport, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, expertReport), section?.caseDocument)
    .addRemoveSectionButton(form?.model.expertReport?.length > 1 || false)
    .build();
};

export const buildJointStatementSection = (section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertStatement}[${expertStatement}][${index}]`;
  const invalidDateErrors = {
    invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, expertStatement),
    invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, expertStatement),
    invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, expertStatement),
    invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, expertStatement),
  };
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT', null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES', '', '', expertStatement, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`, expertStatement))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', 'govuk-!-width-three-half', '', expertStatement, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`, expertStatement))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DATE', invalidDateErrors,'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertStatement, 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index, 'dateInputFields')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertStatement, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, expertStatement), section?.caseDocument)
    .addRemoveSectionButton(form?.model.expertStatement?.length > 1 || false)
    .build();
};

export const buildQuestionsForOtherSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${questionsForExperts}[${questionsForExperts}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER', null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', questionsForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`, questionsForExperts))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, questionsForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`, questionsForExperts))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '', '', questionsForExperts, 'questionDocumentName', section?.questionDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[questionDocumentName]`, questionsForExperts))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', questionsForExperts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, questionsForExperts), section?.caseDocument)
    .addRemoveSectionButton(form?.model.questionsForExperts?.length > 1 || false)
    .build();
};

export const buildAnswersToQuestionsSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${answersForExperts}[${answersForExperts}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS', null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', answersForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`, answersForExperts))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, answersForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`, answersForExperts))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '', '', answersForExperts, 'otherPartyQuestionsDocumentName', section?.otherPartyQuestionsDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyQuestionsDocumentName]`, answersForExperts))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', answersForExperts, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, answersForExperts), section?.caseDocument)
    .addRemoveSectionButton(form?.model.answersForExperts?.length > 1 || false)
    .build();
};
