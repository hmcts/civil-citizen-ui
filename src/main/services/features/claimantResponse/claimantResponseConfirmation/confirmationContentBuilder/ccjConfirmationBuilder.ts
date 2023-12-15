import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getCCJNextSteps = (claim: Claim, lng: string) => {
  const defendantName = claim.getDefendantFullName();
  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', { lng })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG1', { lng })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2', { defendantName, lng })
    .build();
};

export const getCCJNextStepsForRejectedRepaymentPlan = (claim: Claim, lng: string) => {
  const defendantName = claim.getDefendantFullName();
  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', { lng })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3', { lng })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2', { defendantName, lng })
    .build();
};
