import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

export const getNewUpload = (claim: Claim) : ClaimSummarySection[] => {
  return new LatestUpdateSectionBuilder()
    .addTitle('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.NEW_DOCUMENTS')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.VIEW_DOCUMENTS', DEFENDANT_DOCUMENTS_URL.replace(':id', claim.id))
    .build();
};

