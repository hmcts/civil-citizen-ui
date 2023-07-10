import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';

export const getIsCaseReady = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.IS_CASE_READY.PAGE_TITLE')
    .addLeadParagraph('PAGES.IS_CASE_READY.CLAIM_NUMBER', {claimId:caseNumberPrettify(claimId)})
    .addLeadParagraph('PAGES.IS_CASE_READY.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.IS_CASE_READY.IS_CASE_READY')
    .addParagraph('PAGES.IS_CASE_READY.YOU_ARE_REMINDED')
    .build();
};
