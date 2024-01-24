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

export const getRespondSettlementAgreementText = (claim: Claim, req: Request): object => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  let data: object;
  if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
    data = getTextForPayByDate(claim, lang);
  } else if (claim.isFAPaymentOptionInstallments() || claim.isPAPaymentOptionInstallments()){
    data = getTextForPayByInstallments(claim, lang);
  }
  data = {...data, claimant: claim.getClaimantFullName(), defendant: claim.getDefendantFullName()};
  return data;
};

function getTextForPayByDate(claim: Claim, lang: string){
  return {
    agreementText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE', {
      lang: lang,
      defendant: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentDate: formatDateToFullDate(claim.getPaymentIntention().paymentDate, lang),
    }),
    completionDateText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(claim.getPaymentIntention().paymentDate, lang) }),
  };
}

function getTextForPayByInstallments(claim: Claim, lang: string){
  return {
    agreementText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN', {
      lang: lang,
      defendant: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentAmount: getPaymentAmount(claim),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lang),
      frequency: convertFrequencyToTextForRepaymentPlan(getRepaymentFrequency(claim), lang).toLowerCase(),
    }),
    completionDateText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), lang) }),
  };
}
