import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

export const getCancelYourUpload = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.CASE_REFERENCE', {claimId:caseNumberPrettify( claimId)})
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addInsetText('PAGES.EVIDENCE_UPLOAD_CANCEL.WARNING_CANCEL')
    .addTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.ARE_YOU_SURE')
    .build();
};

export async function cancelDocumentUpload(claimId: string) {
  await deleteDraftClaimFromStore(claimId);
}
