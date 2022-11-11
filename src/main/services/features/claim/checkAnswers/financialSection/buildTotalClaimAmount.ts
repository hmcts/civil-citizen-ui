import {SummarySection,summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {YesNo} from '../../../../../common/form/models/yesNo';

const getClaimAmount = (claim?: Claim): number => {
  let claimAmount:number = 0;
  if (claim.claimAmountBreakup && claim.claimAmountBreakup.length > 0) {
    claim.claimAmountBreakup.forEach(item => {
      claimAmount += parseInt(item.value.claimAmount);
    });
  }
  return claimAmount;
};

const getTotalAmount = (claim: Claim, claimInterest:boolean): number => {
  if (claimInterest) {
    return getClaimAmount(claim); // + getInterestToDate(claim)
  }

  return getClaimAmount(claim);
};

const setClaimInterest = (claim: Claim) => {
  if (claim.claimInterest === YesNo.YES) {
    return true;
  } else if (claim.claimInterest === YesNo.NO) {
    return false;
  }
};

export const buildYourTotalClaimAmountSection = (claim: Claim, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  let claimInterest = setClaimInterest(claim);

  let yourTotalClaimAmountSection: SummarySection;

  yourTotalClaimAmountSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT', {lng}), currencyFormatWithNoTrailingZeros(Number(getClaimAmount(claim))), '', ''),
    ],
  });

  if (claimInterest) {
    yourTotalClaimAmountSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.INTEREST_TO_DATE', {lng}), '', '', ''),
    );
  }

  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE', { lng }), '', '', ''));
  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL', { lng }), currencyFormatWithNoTrailingZeros(Number(getTotalAmount(claim,claimInterest))), '', ''));

  return yourTotalClaimAmountSection;
};
