import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

export const buildDisclosureDocumentSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS')
    .addCustomInput('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT','govuk-!-width-three-half', 'PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT_EXAMPLE','disclosure-documents-type')
    .addCustomDateInput('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'disclosure-documents')
    .addCustomUploadInput('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD', 'disclosure-documents')
    .build();
};

export const buildDisclosureListSection = (): ClaimSummarySection[] => {
  return new UploadDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST')
    .addCustomUploadInput('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD', 'disclosure-list')
    .build();
};
