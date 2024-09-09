import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {HELP_WITH_FEES_ELIGIBILITY} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';

const HELP_FEE_SELECTION = 'PAGES.APPLY_HELP_WITH_FEES.START';

function getHearingFee(claim: Claim) {
  const hearingFeeInformation = new HearingFeeInformation(claim.caseProgressionHearing.hearingFeeInformation.hearingFee);
  return hearingFeeInformation.getHearingFeeFormatted();
}

export const getApplyHelpWithFeesContent = (claimId: string, claim: Claim, lng: string) => {
  const feeType = claim?.feeTypeHelpRequested;
  let feeAmount;
  if (claim?.feeTypeHelpRequested === FeeType.HEARING) {
    feeAmount = getHearingFee(claim);
  }
  const linkBefore = `${HELP_FEE_SELECTION}.ELIGIBILITY`;

  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})} <a target="_blank" class="govuk-link" rel="noopener noreferrer" href=${HELP_WITH_FEES_ELIGIBILITY}>${t(`${HELP_FEE_SELECTION}.ELIGIBILITY_LINK`, {lng})}</a>.</p>`;

  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.APPLY_HELP_WITH_FEES.START.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addInsetText('PAGES.APPLY_HELP_WITH_FEES.START.'+feeType+'_FEE_INSET',
      {feeAmount: feeAmount})
    .addRawHtml(linkParagraph)
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
