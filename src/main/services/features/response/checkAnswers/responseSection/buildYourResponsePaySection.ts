
import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {SummaryRow, summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_EXPLANATION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import PaymentOptionType from '../../../../../common/form/models/admission/paymentOption/paymentOptionType';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

const getPaymentOption = (claim: Claim, lang: string | unknown): string => {
  const option = t(`COMMON.PAYMENT_OPTION.${claim.paymentOption}`, {lng: getLng(lang)});
  if (claim.isPaymentOptionBySetDate()) {
    return option + ': ' + formatDateToFullDate(claim.paymentDate);
  }
  return option;
};

const getResponseTitle = (claim: Claim, lang: string | unknown): string => {
  if (claim.isPaymentOptionPayImmediately()) {
    return t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)});
  }
  return t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE', {lng: getLng(lang)});
};

const buildExplanationRow = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow => {
  const explanationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL);
  return summaryRow(t('PAGES.EXPLANATION.TITLE', {lng: getLng(lang)}), claim.statementOfMeans?.explanation?.text, explanationHref, changeLabel(lang));
};

export const buildYourResponsePaySection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  const responseSection = summarySection({
    title: getResponseTitle(claim, lang),
    summaryRows: [],
  });

  switch (claim.paymentOption) {
    case PaymentOptionType.IMMEDIATELY:
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', { lng: getLng(lang) }), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, { lng: getLng(lang) }), yourResponseHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', { lng: getLng(lang) }), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)),
      ]);
      break;
    case PaymentOptionType.BY_SET_DATE:
      responseSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', { lng: getLng(lang) }), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)), buildExplanationRow(claim, claimId, lang)]);
      break;
    case PaymentOptionType.INSTALMENTS: {
      const repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN);
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', { lng: getLng(lang) }), getPaymentOption(claim, lang), paymentOptionHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', { lng: getLng(lang) }), `£${claim.repaymentPlan.paymentAmount}`, repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY', { lng: getLng(lang) }), t(`COMMON.PAYMENT_FREQUENCY.${claim.repaymentPlan.repaymentFrequency}`, { lng: getLng(lang) }), repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT', { lng: getLng(lang) }), formatDateToFullDate(claim.repaymentPlan.firstRepaymentDate), repaymentPlanHref, changeLabel(lang)),
        buildExplanationRow(claim, claimId, lang),
      ]);
    }
  }

  return responseSection;
};
