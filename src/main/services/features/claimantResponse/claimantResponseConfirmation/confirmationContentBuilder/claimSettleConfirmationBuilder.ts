import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getClaimSettleNextSteps = (claim: Claim, lng: string) => {
  const defendantName = claim.getDefendantFullName();
  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', { lng })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.ACCEPTED_DEFENDANT_RESPONSE_TO_SETTLE.CLAIM_SETTLE', { defendantName, lng })
    .build();
};

