import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CLAIM_AMOUNT_URL,
  CLAIM_INTEREST_FROM_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_INTEREST_URL,
  CLAIMANT_INTEREST_RATE_URL,
} from '../../../../../routes/urls';
import {InterestClaimFromType, SameRateInterestType} from '../../../../../common/form/models/claimDetails';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {addClaimAmounts} from './addClaimAmounts';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

export const buildClaimAmountSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  const claimAmountSection = summarySection({
    title: t('CLAIM_AMOUNT', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN', {lng: getLng(lang)}), '', CLAIM_AMOUNT_URL, changeLabel(lang)),
    ],
  });
  addClaimAmounts(claim, claimAmountSection, claimId, lang);
  if (claim?.claimInterest) {
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST', {lng: getLng(lang)}), claim.claimInterest, CLAIM_INTEREST_URL, changeLabel(lang)));
  }
  if (claim?.interestClaimOptions) {
    const interestClaimOptions = 'PAGES.INTEREST_CLAIM_OPTIONS.' + claim.interestClaimOptions;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.INTEREST_CLAIM_OPTIONS.TITLE', {lng: getLng(lang)}), t(interestClaimOptions, {lng: getLng(lang)}), CLAIM_INTEREST_TYPE_URL, changeLabel(lang)));
  }
  if (claim?.sameRateInterestSelection?.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC) {
    const sameRateInterestType = 'PAGES.CLAIMANT_INTEREST_RATE.' + claim.sameRateInterestSelection.sameRateInterestType;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE', {lng: getLng(lang)}), t(sameRateInterestType, {lng: getLng(lang)}), CLAIMANT_INTEREST_RATE_URL, changeLabel(lang)));
  } else if (claim.sameRateInterestSelection?.differentRate) {
    const differentRateInterestType = claim.sameRateInterestSelection.differentRate + '%';
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE', {lng: getLng(lang)}), differentRateInterestType, CLAIMANT_INTEREST_RATE_URL, changeLabel(lang)));
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.REASON', {lng: getLng(lang)}), claim.sameRateInterestSelection.reason, CLAIMANT_INTEREST_RATE_URL, changeLabel(lang)));
  }
  if (claim?.interestClaimFrom) {
    const interestClaimFrom = 'PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.' + claim.interestClaimFrom;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE', {lng: getLng(lang)}), t(interestClaimFrom, {lng: getLng(lang)}), CLAIM_INTEREST_FROM_URL, changeLabel(lang)));
    if (claim?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
      const interestClaimEndDate = 'PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.' + claim.interest.interestEndDate;
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.DATE_INTEREST', {lng: getLng(lang)}), formatDateToFullDate(claim.interest.interestStartDate.date, getLng(lang)), CLAIM_INTEREST_FROM_URL, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.REASON', {lng: getLng(lang)}), claim.interest.interestStartDate.reason, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE', {lng: getLng(lang)}), t(interestClaimEndDate, {lng: getLng(lang)}), CLAIM_INTEREST_FROM_URL, changeLabel(lang)));
    }
  }
  if (claim?.interest) {
    claimAmountSection.summaryList.rows.push(summaryRow(t('Help with fees reference number', {lng: getLng(lang)}), '', '', changeLabel(lang)));
  }
  return claimAmountSection;
};

