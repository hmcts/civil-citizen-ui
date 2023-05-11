import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {CASE_DOCUMENT_DOWNLOAD_URL, UPLOAD_YOUR_DOCUMENTS_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

export const getEvidenceUpload = (claim: Claim) : ClaimSummarySection[] => {
  if (claim?.caseProgressionHearing?.hearingDate){
    return getEvidenceUploadSectionWithBundleDeadline(claim.id, claim.bundleStitchingDeadline);
  } else {
    return getEvidenceUploadSection(claim.id);
  }
};

const getEvidenceUploadSectionWithBundleDeadline = (claimId: string, deadline: string) : ClaimSummarySection[] => {
  return new LatestUpdateSectionBuilder()
    .addTitle('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE')
    .addWarning('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_DUE_BY', {bundleStitchingDeadline: deadline})
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.YOU_CAN_UPLOAD_AND_SUBMIT_DOCUMENTS')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.SDO', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SDO_ORDER), 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOLLOW_INSTRUCTIONS_IN', 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOUND_UNDER_NOTICES_AND_ORDERS')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_SUBMITTED_NOT_CONSIDERED')
    .addButton('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE', UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId))
    .build();
};

const getEvidenceUploadSection = (claimId: string) : ClaimSummarySection[] => {
  return new LatestUpdateSectionBuilder()
    .addTitle('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.YOU_CAN_UPLOAD_AND_SUBMIT_DOCUMENTS')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.SDO', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SDO_ORDER), 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOLLOW_INSTRUCTIONS_IN', 'PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.FOUND_UNDER_NOTICES_AND_ORDERS')
    .addButton('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE', UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId))
    .build();
};
