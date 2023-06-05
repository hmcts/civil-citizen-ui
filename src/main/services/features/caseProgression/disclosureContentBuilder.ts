import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

const disclosureDocumentsType = 'disclosure_documents';
const disclosureList = 'disclosure_list';
const fileUpload = 'file_upload';

export const buildDisclosureDocumentSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS')
    .addInputArray('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT','govuk-!-width-three-half','PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT_EXAMPLE',disclosureDocumentsType,'type')
    .addDateArray('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', disclosureDocumentsType)
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', disclosureDocumentsType, fileUpload)
    .build();
};

export const buildDisclosureListSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST')
    .addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD','', disclosureList, fileUpload)
    .build();
};
