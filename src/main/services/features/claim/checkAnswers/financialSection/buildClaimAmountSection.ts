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
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {addClaimAmounts} from './addClaimAmounts';
import {YesNo} from 'form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const buildClaimAmountSection = (claim: Claim, lang: string ): SummarySection => {
  const lng = getLng(lang);
  const claimAmountSection = summarySection({
    title: t('COMMON.CLAIM_AMOUNT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN', {lng}), '', CLAIM_AMOUNT_URL, changeLabel(lang)),
    ],
  });
  addClaimAmounts(claim, claimAmountSection, lang);
  if (claim?.claimInterest) {
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST', {lng}), claim.claimInterest, CLAIM_INTEREST_URL, changeLabel(lang)));
  }
  if (claim?.interest?.interestClaimOptions) {
    const interestClaimOptions = 'PAGES.INTEREST_CLAIM_OPTIONS.' + claim.interest?.interestClaimOptions;
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.INTEREST_CLAIM_OPTIONS.TITLE', {lng}), t(interestClaimOptions, {lng}), CLAIM_INTEREST_TYPE_URL, changeLabel(lang)));
  }
  if (claim?.isSameRateTypeEightPercent()) {
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
    if (claim?.isInterestFromASpecificDate()) {
      const interestClaimEndDate = 'PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.' + claim.interest.interestEndDate;
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.DATE_INTEREST', {lng}), formatDateToFullDate(claim.interest.interestStartDate.date, getLng(lang)), CLAIM_INTEREST_DATE_URL, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.REASON', {lng}), claim.interest.interestStartDate.reason, changeLabel(lang)));
      claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE', {lng}), t(interestClaimEndDate, {lng}), CLAIM_INTEREST_DATE_URL, changeLabel(lang)));
    }
  }
  if (claim.claimDetails?.helpWithFees) {
    const hwfReferenceNumber = (claim.claimDetails?.helpWithFees.option === YesNo.YES) ? claim.claimDetails.helpWithFees.referenceNumber : t('PAGES.HELP_WITH_FEES.REFERENCE_NUMBER_NONE', {lng});
    claimAmountSection.summaryList.rows.push(summaryRow(t('PAGES.HELP_WITH_FEES.REFERENCE_NUMBER', {lng}), hwfReferenceNumber, CLAIM_HELP_WITH_FEES_URL, changeLabel(lang)));
  }
  return claimAmountSection;
};
