import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const expertReportType = 'expert_report';
const fileUpload = 'file_upload';
const expertJointStatementType = 'expert_report';
const expertQuestionsForOtherType = 'expert_report';
const expertAnswersToQuestionsType = 'expert_report';

export const buildExpertReportSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_NAME','govuk-!-width-three-half','',expertReportType,'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE','govuk-!-width-three-half','',expertReportType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.DATE_REPORT_WAS', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertReportType)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', expertReportType, fileUpload)
    .build();
};

export const buildJointStatementSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERTS_NAMES','govuk-!-width-three-half','',expertJointStatementType,'type')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.EXPERT.FIELD_EXPERTISE','govuk-!-width-three-half','',expertJointStatementType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', expertJointStatementType)
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
