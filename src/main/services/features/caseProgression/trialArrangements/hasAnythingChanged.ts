import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

export const getHasAnythingChanged = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.HAS_ANYTHING_CHANGED.FINALISE')
    .addLeadParagraph('PAGES.HAS_ANYTHING_CHANGED.CLAIM_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-0')
    .addLeadParagraph('PAGES.HAS_ANYTHING_CHANGED.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.HAS_ANYTHING_CHANGED.HAS_ANYTHING')
    .addLink('PAGES.HAS_ANYTHING_CHANGED.DIRECTIONS',CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.DEFENDANT_DEFENCE), 'PAGES.HAS_ANYTHING_CHANGED.YOU_CAN')
    .build();
};
