import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {DASHBOARD_CLAIMANT_URL, HEARING_FEE_APPLY_HELP_FEE_SELECTION} from 'routes/urls';

function getHearingFee(claim: Claim) {
  return convertToPoundsFilter(claim?.hearingFee?.calculatedAmountInPence);
}

export const getPayHearingFeeStartScreenContent = (claim: Claim) => {
  const hearingFee = getHearingFee(claim);
  const hearingFeePaymentDeadline = claim.hearingFeePaymentDeadline;
  const startHref = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claim.id);
  const cancelHref = DASHBOARD_CLAIMANT_URL.replace(':id', claim.id);
  return new PageSectionBuilder().addMicroText('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY', {
      hearingFee:hearingFee,
      hearingFeePaymentDeadline:hearingFeePaymentDeadline,
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY')
    .addStartButtonWithLink('PAGES.PAY_HEARING_FEE.START.START_NOW', startHref, cancelHref).build();
};
