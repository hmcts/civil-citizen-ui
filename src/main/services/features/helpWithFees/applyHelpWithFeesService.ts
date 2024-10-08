import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {HELP_WITH_FEES_ELIGIBILITY} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

function getHearingFee(claim: Claim) {
  const hearingFeeInformation = new HearingFeeInformation(claim.caseProgressionHearing.hearingFeeInformation.hearingFee);
  return hearingFeeInformation.getHearingFeeFormatted();
}

export const getApplyHelpWithFeesContent = (claimId: string, claim: Claim) => {
  const feeType = claim?.feeTypeHelpRequested;
  let feeAmount;
  if (claim?.feeTypeHelpRequested === FeeType.HEARING) {
    feeAmount = getHearingFee(claim);
  }

  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.APPLY_HELP_WITH_FEES.START.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addInsetText('PAGES.APPLY_HELP_WITH_FEES.START.'+feeType+'_FEE_INSET',
      {feeAmount: feeAmount})
    .addFullStopLink('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK', HELP_WITH_FEES_ELIGIBILITY, 'PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY', null, null, true)
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
