import {SummarySection, summarySection} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {SummaryRow, summaryRow} from 'common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CITIZEN_EXPLANATION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN_FULL_URL,
  CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'common/form/models/responseType';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {RepaymentPlan} from 'common/models/repaymentPlan';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const getResponseTitle = (claim: Claim, lang: string | unknown): string => {
  if (claim.isFullAdmission() && claim.isFAPaymentOptionPayImmediately()) {
    return t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)});
  }
  return t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE', {lng: getLng(lang)});
};

const buildExplanationRow = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow => {
  const explanationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL);
  const explanationText = claim.statementOfMeans?.explanation?.text ? claim.statementOfMeans.explanation.text : '';
  return summaryRow(t('PAGES.EXPLANATION.TITLE', {lng: getLng(lang)}), explanationText, explanationHref, changeLabel(lang));
};

export const buildYourResponsePaymentSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  let paymentOptionHref: string;
  let repaymentPlanHref: string;
  let paymentOption: string;
  let paymentDate: Date;
  let repaymentPlan: RepaymentPlan;

  const responseSection = summarySection({
    title: getResponseTitle(claim, lang),
    summaryRows: [],
  });

  switch (claim.respondent1.responseType) {
    case ResponseType.FULL_ADMISSION:
      paymentOption = claim.fullAdmission?.paymentIntention?.paymentOption ? claim.fullAdmission.paymentIntention.paymentOption : undefined;
      paymentDate = new Date(claim.fullAdmission?.paymentIntention?.paymentDate);
      repaymentPlan = claim.fullAdmission?.paymentIntention?.repaymentPlan ? claim.fullAdmission.paymentIntention.repaymentPlan : undefined;
      paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
      repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_FULL_URL);
      break;
    case ResponseType.PART_ADMISSION:
      paymentOption = claim.partialAdmission?.paymentIntention?.paymentOption ? claim.partialAdmission.paymentIntention.paymentOption : undefined;
      paymentDate = new Date(claim.partialAdmission?.paymentIntention?.paymentDate);
      repaymentPlan = claim.partialAdmission?.paymentIntention?.repaymentPlan ? claim.partialAdmission.paymentIntention.repaymentPlan : undefined;
      paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
      repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_PARTIAL_URL);
      break;
  }

  switch (paymentOption) {
    case PaymentOptionType.IMMEDIATELY:
      if (claim.isFullAdmission()) {
        responseSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', {lng: getLng(lang)}), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, {lng: getLng(lang)}), yourResponseHref, changeLabel(lang)));
      }
      responseSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_OPTION.${paymentOption}`, {lng: getLng(lang)}), paymentOptionHref, changeLabel(lang)));
      break;
    case PaymentOptionType.BY_SET_DATE:
      responseSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_OPTION.${paymentOption}`, {lng: getLng(lang)}) + ': ' + formatDateToFullDate(paymentDate, getLng(lang)), paymentOptionHref, changeLabel(lang)), buildExplanationRow(claim, claimId, lang)]);
      break;
    case PaymentOptionType.INSTALMENTS: {
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_OPTION.${paymentOption}`, {lng: getLng(lang)}), paymentOptionHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', {lng: getLng(lang)}), `${currencyFormatWithNoTrailingZeros(repaymentPlan?.paymentAmount)}`, repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_FREQUENCY.${repaymentPlan?.repaymentFrequency}`, {lng: getLng(lang)}), repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT', {lng: getLng(lang)}), formatDateToFullDate(repaymentPlan?.firstRepaymentDate, getLng(lang)), repaymentPlanHref, changeLabel(lang)),
        buildExplanationRow(claim, claimId, lang),
      ]);
    }
  }

  return responseSection;
};
