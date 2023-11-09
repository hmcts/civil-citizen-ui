import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';

function getHearingFee(claim: Claim) {
  return 70;
}

export const getApplyHelpWithFeesContent = (claim: Claim) => {
  //Make sure CIV-11185 needs to save a feeType in Redis for our use.
  //Currently it's implemented to be saved in caseProgression - not very helpful.
  let feeAmount, feeType;
  feeAmount = getHearingFee(claim);
  feeType = 'HEARING';
  return new PageSectionBuilder()
    .addMicroText('PAGES.APPLY_HELP_WITH_FEES.START.'+feeType+'_FEE')
    .addMainTitle('PAGES.APPLY_HELP_WITH_FEES.START.TITLE')
    .addInsetText('PAGES.APPLY_HELP_WITH_FEES.START.'+feeType+'_FEE_INSET',
      {feeAmount: feeAmount})
    .addLink('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK', 'https://www.gov.uk/get-help-with-court-fees#eligibility', 'PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY', '.')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED')
    .addTitle('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION')
    .build();
};
