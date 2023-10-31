import { Request} from 'express';
import {
  convertFrequencyToTextForRepaymentPlan,
  getAmount,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';

export const getPaymentText = (claim: Claim, req: Request): object => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
    return getTextForPayByDate(claim, lang);
  } else if (claim.isFAPaymentOptionInstallments() || claim.isPAPaymentOptionInstallments()){
    return getTextForPayByInstallments(claim, lang);
  }
};

function getTextForPayByDate(claim: Claim, lang: string){
  return {
    paymentText: t('PAGES.CHECK_YOUR_ANSWER.WILL_PAY_BY_PAYMENT_DATE', {
      lang: lang,
      fullName: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentDate: formatDateToFullDate(claim.getPaymentDate()),
    }),
    completionDate: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(claim.getPaymentDate()) }),
  };
}

function getTextForPayByInstallments(claim: Claim, lang: string){
  return {
    paymentText: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT', {
      lang: lang,
      fullName: claim.getDefendantFullName(),
      amount: getAmount(claim),
      instalmentAmount: getPaymentAmount(claim),
      instalmentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lang),
      frequency: convertFrequencyToTextForRepaymentPlan(getRepaymentFrequency(claim), lang).toLowerCase(),
    }),
    completionDate: t('PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), lang) }),
  };
}
