import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CLAIM_AMOUNT_URL,
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_DATE_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_INTEREST_URL,
  CLAIM_INTEREST_RATE_URL,
} from '../../../../../routes/urls';
import {InterestClaimFromType, SameRateInterestType} from '../../../../../common/form/models/claimDetails';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {addClaimAmounts} from './addClaimAmounts';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const buildClaimAmountSection = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  const lng = getLng(lang);
  const claimAmountSection = summarySection({
    title: t('COMMON.CLAIM_AMOUNT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN', {lng}), '', CLAIM_AMOUNT_URL, changeLabel(lang)),
    ],
  });
  addClaimAmounts(claim, claimAmountSection, claimId, lang);
  if (claim?.claimInterest) {
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST', {lng}), claim.claimInterest, CLAIM_INTEREST_URL, changeLabel(lang)));
  }
  if (claim?.interest?.interestClaimOptions) {
    const interestClaimOptions = 'PAGES.INTEREST_CLAIM_OPTIONS.' + claim.interest?.interestClaimOptions;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.INTEREST_CLAIM_OPTIONS.TITLE', {lng}), t(interestClaimOptions, {lng}), CLAIM_INTEREST_TYPE_URL, changeLabel(lang)));
  }
  if (claim?.interest?.sameRateInterestSelection?.sameRateInterestType === SameRateInterestType.SAME_RATE_INTEREST_8_PC) {
    const sameRateInterestType = 'PAGES.CLAIMANT_INTEREST_RATE.' + claim.interest?.sameRateInterestSelection.sameRateInterestType;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE', {lng}), t(sameRateInterestType, {lng}), CLAIM_INTEREST_RATE_URL, changeLabel(lang)));
  } else if (claim.interest?.sameRateInterestSelection?.differentRate) {
    const differentRateInterestType = claim.interest?.sameRateInterestSelection.differentRate + '%';
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE', {lng}), differentRateInterestType, CLAIM_INTEREST_RATE_URL, changeLabel(lang)));
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIMANT_INTEREST_RATE.REASON', {lng}), claim.interest?.sameRateInterestSelection.reason, CLAIM_INTEREST_RATE_URL, changeLabel(lang)));
  }
  if (claim?.interest?.interestClaimFrom) {
    const interestClaimFrom = 'PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.' + claim.interest?.interestClaimFrom;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE', {lng}), t(interestClaimFrom, {lng}), CLAIM_INTEREST_DATE_URL, changeLabel(lang)));
    if (claim?.interest?.interestClaimFrom === InterestClaimFromType.FROM_A_SPECIFIC_DATE) {
      const interestClaimEndDate = 'PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.' + claim.interest.interestEndDate;
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.DATE_INTEREST', {lng}), formatDateToFullDate(claim.interest.interestStartDate.date, getLng(lang)), CLAIM_INTEREST_DATE_URL, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.REASON', {lng}), claim.interest.interestStartDate.reason, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE', {lng}), t(interestClaimEndDate, {lng}), CLAIM_INTEREST_DATE_URL, changeLabel(lang)));
    }
  }
  if (claim.claimDetails?.helpWithFees) {
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.HELP_WITH_FEES.REFERENCE_NUMBER', {lng}), claim.claimDetails.helpWithFees.referenceNumber, CLAIM_HELP_WITH_FEES_URL, changeLabel(lang)));
  }
  return claimAmountSection;
};

