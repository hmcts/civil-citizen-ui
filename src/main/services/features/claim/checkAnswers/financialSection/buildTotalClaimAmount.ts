import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {calculateInterestToDate} from 'common/utils/interestUtils';

const getClaimAmount = (claim?: Claim): number => {
  return Number(claim.totalClaimAmount);
};

const getInterestToDate = (claim: Claim): number => {
  return Number(calculateInterestToDate(claim));
};

const getTotalAmount = (claim: Claim): number => {
  return !hasClaimInterest(claim) ? Number(getClaimAmount(claim)) : Number(getClaimAmount(claim)) + getInterestToDate(claim);
};

const hasClaimInterest = (claim: Claim) => {
  return claim.claimInterest === YesNo.YES;
};

export const buildYourTotalClaimAmountSection = (claim: Claim, claimFee: any, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  let yourTotalClaimAmountSection: SummarySection;
  const grandTotal = getTotalAmount(claim) + claimFee;

  yourTotalClaimAmountSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE', {lng}),
    summaryRows: [summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT', {lng}), currencyFormatWithNoTrailingZeros(getClaimAmount(claim)), '', '')],
  });

  if (hasClaimInterest(claim)) {
    yourTotalClaimAmountSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.INTEREST_TO_DATE', {lng}), currencyFormatWithNoTrailingZeros(getInterestToDate(claim)), '', ''),
    );
  }

  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE', {lng}), currencyFormatWithNoTrailingZeros(Number(claimFee)), '', ''));
  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL', {lng}), currencyFormatWithNoTrailingZeros(grandTotal), '', ''));

  return yourTotalClaimAmountSection;
};
