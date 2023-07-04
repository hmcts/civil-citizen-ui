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
const fileUpload = 'file_upload';

export const buildExpertReportSection = (section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertReport}[${index}]`;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', expertReport, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', '', '', expertReport, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertReport)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertReport, fileUpload)
    .addRemoveSectionButton(form?.model.expertReport?.length > 1 || false)
    .build();
};

export const buildJointStatementSection = (section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${expertStatement}[${index}]`;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES', '', '', expertStatement, 'multipleExpertsName', section?.multipleExpertsName, index, form?.errorFor(`${errorFieldNamePrefix}[multipleExpertsName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE', 'govuk-!-width-three-half', '', expertStatement, 'fieldOfExpertise', section?.fieldOfExpertise, index, form?.errorFor(`${errorFieldNamePrefix}[fieldOfExpertise]`))
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertStatement)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', expertStatement, fileUpload)
    .addRemoveSectionButton(form?.model.expertStatement?.length > 1 || false)
    .build();
};

export const buildQuestionsForOtherSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${questionsForExperts}[${index}]`;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER', null, 'govuk-!-width-three-quarters')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', questionsForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, questionsForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_YOU', '', '', questionsForExperts, 'questionDocumentName', section?.questionDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[questionDocumentName]`))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', questionsForExperts, fileUpload)
    .addRemoveSectionButton(form?.model.questionsForExperts?.length > 1 || false)
    .build();
};

export const buildAnswersToQuestionsSection = (selectItems: ({ text: string; value: string })[], section: ExpertSection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null): ClaimSummarySection[] => {
  const errorFieldNamePrefix = `${answersForExperts}[${index}]`;

  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME', '', '', answersForExperts, 'expertName', section?.expertName, index, form?.errorFor(`${errorFieldNamePrefix}[expertName]`))
    .addSelect('PAGES.UPLOAD_DOCUMENTS.EXPERT.OTHER_PARTY_NAME', '', '', 'PAGES.UPLOAD_DOCUMENTS.EXPERT.SELECT', selectItems, answersForExperts, 'otherPartyName', section?.otherPartyName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyName]`))
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.NAME_DOCUMENT_WITH', '', '', answersForExperts, 'otherPartyQuestionsDocumentName', section?.otherPartyQuestionsDocumentName, index, form?.errorFor(`${errorFieldNamePrefix}[otherPartyQuestionsDocumentName]`))
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', answersForExperts, fileUpload)
    .addRemoveSectionButton(form?.model.answersForExperts?.length > 1 || false)
    .build();
};
