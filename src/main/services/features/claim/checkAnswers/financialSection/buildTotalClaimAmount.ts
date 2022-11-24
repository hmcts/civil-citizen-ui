import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {calculateInterestToDate} from 'common/utils/interestUtils';

export const buildYourTotalClaimAmountSection = (claim: Claim, claimFee: number, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const interestToDate = (claim.hasInterest()) ? calculateInterestToDate(claim) : 0;
  const grandTotal = Number(claim.totalClaimAmount) + interestToDate + claimFee;

  const yourTotalClaimAmountSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE', {lng}),
    summaryRows: [summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT', {lng}), currencyFormatWithNoTrailingZeros(Number(claim.totalClaimAmount)), '', '')],
  });

  if (claim.hasInterest()) {
    yourTotalClaimAmountSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.INTEREST_TO_DATE', {lng}), currencyFormatWithNoTrailingZeros(interestToDate), '', ''),
    );
  }

  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE', {lng}), currencyFormatWithNoTrailingZeros(Number(claimFee)), '', ''));
  yourTotalClaimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL', {lng}), currencyFormatWithNoTrailingZeros(grandTotal), '', ''));

  return yourTotalClaimAmountSection;
};
