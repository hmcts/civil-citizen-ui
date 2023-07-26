import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';

export const getIsCaseReady = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.IS_CASE_READY.PAGE_TITLE')
    .addLeadParagraph('PAGES.IS_CASE_READY.CLAIM_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-0')
    .addLeadParagraph('PAGES.IS_CASE_READY.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.IS_CASE_READY.IS_CASE_READY',null,'govuk-!-margin-bottom-0')
    .addParagraph('PAGES.IS_CASE_READY.YOU_ARE_REMINDED')
    .build();
};
