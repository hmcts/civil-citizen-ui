import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getCustomDateInput,
  getCustomInput, getCustomUploadInput, getTitle,
} from 'services/features/caseProgression/uploadDocumentsSection';

export const buildDisclosureDocumentSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];

  const subtitle = getTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
  const inputContent = getCustomInput('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT','govuk-!-width-three-half', 'PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.TYPE_OF_DOCUMENT_EXAMPLE','disclosure-documents-type');
  const dateContent = getCustomDateInput('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DOCUMENT_ISSUE_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', 'disclosure-documents');
  const uploadContent = getCustomUploadInput('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD', 'disclosure-documents');

  sectionContent.push(subtitle);
  sectionContent.push(inputContent);
  sectionContent.push(dateContent);
  sectionContent.push(uploadContent);

  return sectionContent.flat();
};

export const buildDisclosureListSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];

  const subtitle = getTitle('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  const uploadContent = getCustomUploadInput('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD', 'disclosure-list');

  sectionContent.push(subtitle);
  sectionContent.push(uploadContent);

  return sectionContent.flat();
};
