import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';
import {CASE_DOCUMENT_DOWNLOAD_URL, UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

export const getEvidenceUpload = (claim: Claim) => {
  return new PageSectionBuilder()
    .addTitle('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.YOU_CAN_UPLOAD_AND_SUBMIT_DOCUMENTS')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.SDO', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentType', DocumentUri.SDO_ORDER), 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOLLOW_INSTRUCTIONS_IN', 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOUND_UNDER_NOTICES_AND_ORDERS')
    .addButton('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE', UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claim.id))
    .build();
};
