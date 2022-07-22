import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {SummaryRow, summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_EXPLANATION_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN_FULL_URL,
  CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import PaymentOptionType from '../../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

const getPaymentOption = (claim: Claim, paymentOption: string, paymentDate: Date, lang: string | unknown): string => {
  const option = t(`COMMON.PAYMENT_OPTION.${paymentOption}`, { lng: getLng(lang) });
  const getFormatDate = (option:string) => option + ': ' + formatDateToFullDate(paymentDate);
  if (claim.isFullAdmission() && claim.isPaymentOptionBySetDate()) {
    return getFormatDate(option);
  } else if (claim.isPartialAdmission() && claim.isPartialAdmissionPaymentOptionBySetDate()) {
    return getFormatDate(option);
  }
  return option;
};

const getResponseTitle = (claim: Claim, lang: string | unknown): string => {
  if (claim.isFullAdmission() && claim.isPaymentOptionPayImmediately()) {
    return t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)});
  }
  return t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE', {lng: getLng(lang)});
};

const buildExplanationRow = (claim: Claim, claimId: string, lang: string | unknown): SummaryRow => {
  const explanationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_EXPLANATION_URL);
  return summaryRow(t('PAGES.EXPLANATION.TITLE', {lng: getLng(lang)}), claim.statementOfMeans?.explanation?.text, explanationHref, changeLabel(lang));
};

export const buildYourResponsePaymentSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  let paymentOptionHref: string;
  let repaymentPlanHref: string;
  let paymentOption: string;
  let paymentDate: Date;

  const responseSection = summarySection({
    title: getResponseTitle(claim, lang),
    summaryRows: [],
  });


  switch (claim.respondent1?.responseType) {
    case ResponseType.FULL_ADMISSION:
      paymentOption = claim.paymentOption;
      paymentDate = new Date(claim.paymentDate);
      paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
      repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_FULL_URL);
      break;
    case ResponseType.PART_ADMISSION:
      paymentOption = claim.partialAdmission?.paymentIntention?.paymentOption;
      paymentDate = new Date(claim.partialAdmission?.paymentIntention?.paymentDate);
      paymentOptionHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL);
      repaymentPlanHref = constructResponseUrlWithIdParams(claimId, CITIZEN_REPAYMENT_PLAN_PARTIAL_URL);
      break;
  }

  switch (paymentOption) {
    case PaymentOptionType.IMMEDIATELY:
      claim.respondent1?.responseType === ResponseType.FULL_ADMISSION ?
        responseSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', {lng: getLng(lang)}), t(`COMMON.RESPONSE_TYPE.${claim.respondent1?.responseType}`, {lng: getLng(lang)}), yourResponseHref, changeLabel(lang)))
        : null;
      responseSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, paymentOption, paymentDate, lang), paymentOptionHref, changeLabel(lang)));
      break;
    case PaymentOptionType.BY_SET_DATE:
      responseSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, paymentOption, paymentDate, lang), paymentOptionHref, changeLabel(lang)), buildExplanationRow(claim, claimId, lang)]);
      break;
    case PaymentOptionType.INSTALMENTS: {
      responseSection.summaryList.rows.push(...[
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY', {lng: getLng(lang)}), getPaymentOption(claim, paymentOption, paymentDate, lang), paymentOptionHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS', {lng: getLng(lang)}), `${currencyFormatWithNoTrailingZeros(claim.repaymentPlan?.paymentAmount)}`, repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY', {lng: getLng(lang)}), t(`COMMON.PAYMENT_FREQUENCY.${claim.repaymentPlan?.repaymentFrequency}`, {lng: getLng(lang)}), repaymentPlanHref, changeLabel(lang)),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT', {lng: getLng(lang)}), formatDateToFullDate(claim.repaymentPlan?.firstRepaymentDate), repaymentPlanHref, changeLabel(lang)),
        buildExplanationRow(claim, claimId, lang),
      ]);
    }
  }

  return responseSection;
};
