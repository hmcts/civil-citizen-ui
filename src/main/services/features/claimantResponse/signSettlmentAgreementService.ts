import {Request} from 'express';
import {
  convertFrequencyToTextForRepaymentPlan,
  getAmount,
  getFinalPaymentDate, getFinalPaymentDateForClaimantPlan,
  getFirstRepaymentDate, getFirstRepaymentDateClaimantPlan,
  getPaymentAmount, getPaymentAmountClaimantPlan,
  getRepaymentFrequency, getRepaymentFrequencyForClaimantPlan,
} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';

export const getPaymentText = (claim: Claim, req: Request): object => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  let data: object;
  if (claim.hasCourtAcceptedClaimantsPlan()) {
    if (claim.claimantResponse.suggestedPaymentIntention.paymentOption == PaymentOptionType.BY_SET_DATE) {
      data = getTextForPayByDate(claim, lang, true);
    } else if (claim.claimantResponse.suggestedPaymentIntention.paymentOption == PaymentOptionType.INSTALMENTS) {
      data = getTextForPayByInstallments(claim, lang, true);
    }
  } else {
    if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
      data = getTextForPayByDate(claim, lang, false);
    } else if (claim.isFAPaymentOptionInstallments() || claim.isPAPaymentOptionInstallments()) {
      data = getTextForPayByInstallments(claim, lang, false);
    }
  }
  data = {...data, claimant: claim.getClaimantFullName(), defendant: claim.getDefendantFullName()};
  return data;
};

function getTextForPayByDate(claim: Claim, lang: string, isClaimantPlanAccepted: boolean) {
  let paymentDate = claim.getPaymentDate();
  if (isClaimantPlanAccepted) {
    const date = claim.claimantResponse.suggestedPaymentIntention.paymentDate as unknown as PaymentDate;
    paymentDate = date.date;
  }
  return {
    paymentText: t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', {
      lng: lang,
      fullName: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentDate: formatDateToFullDate(paymentDate, lang),
    }),
    completionDate: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', {finalRepaymentDate: formatDateToFullDate(paymentDate, lang)}),
  };
}

function getTextForPayByInstallments(claim: Claim, lang: string, isClaimantPlanAccepted: boolean) {
  return {
    paymentText: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT', {
      lng: lang,
      fullName: claim.getDefendantFullName(),
      amount: getAmount(claim),
      instalmentAmount: isClaimantPlanAccepted ? getPaymentAmountClaimantPlan(claim) : getPaymentAmount(claim),
      instalmentDate: isClaimantPlanAccepted ? formatDateToFullDate(getFirstRepaymentDateClaimantPlan(claim), lang) : formatDateToFullDate(getFirstRepaymentDate(claim), lang),
      frequency: isClaimantPlanAccepted ? convertFrequencyToTextForRepaymentPlan(getRepaymentFrequencyForClaimantPlan(claim), lang) : convertFrequencyToTextForRepaymentPlan(getRepaymentFrequency(claim), lang).toLowerCase(),
    }),
    completionDate: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', {finalRepaymentDate:  isClaimantPlanAccepted ?formatDateToFullDate(getFinalPaymentDateForClaimantPlan(claim),lang):formatDateToFullDate(getFinalPaymentDate(claim), lang)}),
  };
}
