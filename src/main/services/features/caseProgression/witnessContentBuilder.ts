import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const witnessEvidence = 'witness-evidence';
const yourStatement = witnessEvidence + '-your-statement';
const witnessStatement = witnessEvidence + '-witness-statement';
const witnessSummary = witnessEvidence + '-witness-summary';
const noticeOfHearsayEvidence = witnessEvidence + '-notice';
const documentsInStatement = witnessEvidence + '-documents';

const fileUpload = 'file_upload';
const widthThreeHalfClass = 'govuk-!-width-three-half';

export const buildYourStatement = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.YOUR_STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.YOUR_NAME', widthThreeHalfClass, '', yourStatement, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', yourStatement)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', yourStatement, fileUpload)
    .build();
};

export const buildWitnessStatement = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', witnessStatement, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_STATEMENT', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessStatement)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessStatement, fileUpload)
    .build();
};

export const buildWitnessSummary = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', witnessSummary, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', witnessSummary)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', witnessSummary, fileUpload)
    .build();
};

export const buildNoticeOfHearsayEvidence = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.WITNESS_NAME', widthThreeHalfClass, '', noticeOfHearsayEvidence, 'name')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DATE_SUMMARY', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', noticeOfHearsayEvidence)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', noticeOfHearsayEvidence, fileUpload)
    .build();
};

export const buildDocumentsInStatement = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT', widthThreeHalfClass, 'PAGES.UPLOAD_DOCUMENTS.WITNESS.TYPE_OF_DOCUMENT_HINT', documentsInStatement, 'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', documentsInStatement)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', documentsInStatement, fileUpload)
    .build();
};
