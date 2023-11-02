import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {Claim} from 'models/claim';

function getHearingFee(claim: Claim) {
  return claim?.hearingFee?.calculatedAmountInPence / 100;
}

export const getPayHearingFeeStartScreenContent = (claim: Claim) => {
  const hearingFee = getHearingFee(claim);
  const hearingFeePaymentDeadline = claim.hearingFeePaymentDeadline;
  return new PageSectionBuilder().addMicroText('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY', {
      hearingFee:hearingFee,
      hearingFeePaymentDeadline:hearingFeePaymentDeadline,
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY')
    .addStartButtonWithLink('PAGES.PAY_HEARING_FEE.START.START_NOW', 'href', 'href').build();
};
