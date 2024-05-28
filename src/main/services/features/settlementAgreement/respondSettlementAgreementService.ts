import { Request} from 'express';
import {
  convertFrequencyToTextForRepaymentPlan,
  getAmount,
  getFinalPaymentDate,
  getFinalPaymentDateForClaimantPlan,
  getFirstRepaymentDate,
  getFirstRepaymentDateClaimantPlan,
  getPaymentAmount,
  getPaymentAmountClaimantPlan,
  getRepaymentFrequency,
  getRepaymentFrequencyForClaimantPlan,
} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'common/models/claim';
import {t} from 'i18next';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';

export const getRespondSettlementAgreementText = (claim: Claim, req: Request): object => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  let data: object;
  if(claim.hasCourtAcceptedClaimantsPlan()) {
    const suggestedPaymentIntentionOption = claim.getSuggestedPaymentIntentionOptionFromClaimant();
    if(suggestedPaymentIntentionOption === PaymentOptionType.BY_SET_DATE) {
      data = getTextForPayByDate(claim, lang, true);
    }
    else if(suggestedPaymentIntentionOption === PaymentOptionType.INSTALMENTS) {
      data = getTextForPayByInstallments(claim, lang, true);
    }  else if (suggestedPaymentIntentionOption === PaymentOptionType.IMMEDIATELY) {
      data = getTextForPayImmediately(claim, lang);
    }
  }
  else { if (claim.isPAPaymentOptionByDate() || claim.isFAPaymentOptionBySetDate()) {
    data = getTextForPayByDate(claim, lang, false);
  } else if (claim.isFAPaymentOptionInstallments() || claim.isPAPaymentOptionInstallments()){
    data = getTextForPayByInstallments(claim, lang, false);
  }
  }
  data = {...data, claimant: claim.getClaimantFullName(), defendant: claim.getDefendantFullName()};
  return data;
};

function getTextForPayByDate(claim: Claim, lang: string, isClaimantPlanAccepted: boolean){
  let paymentDate = claim.getPaymentDate();
  if (isClaimantPlanAccepted) {
    paymentDate = claim.claimantResponse.suggestedPaymentIntention.paymentDate as unknown as Date;
  }
  return {
    agreementText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_BY_SET_DATE', {
      lng: lang,
      defendant: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentDate: formatDateToFullDate(paymentDate, lang),
    }),
    completionDateText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(paymentDate, lang) }),
  };
}

function getTextForPayByInstallments(claim: Claim, lang: string, isClaimantPlanAccepted: boolean){
  return {
    agreementText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.REPAYMENT_PLAN', {
      lng: lang,
      defendant: claim.getDefendantFullName(),
      amount: getAmount(claim),
      paymentAmount: isClaimantPlanAccepted ? getPaymentAmountClaimantPlan(claim) : getPaymentAmount(claim),
      firstRepaymentDate: isClaimantPlanAccepted ? formatDateToFullDate(getFirstRepaymentDateClaimantPlan(claim), lang) : formatDateToFullDate(getFirstRepaymentDate(claim), lang),
      frequency: isClaimantPlanAccepted ? convertFrequencyToTextForRepaymentPlan(getRepaymentFrequencyForClaimantPlan(claim), lang) : convertFrequencyToTextForRepaymentPlan(getRepaymentFrequency(claim), lang).toLowerCase(),
    }),
    completionDateText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate:  isClaimantPlanAccepted ? formatDateToFullDate(getFinalPaymentDateForClaimantPlan(claim),lang) : formatDateToFullDate(getFinalPaymentDate(claim), lang) }),
  };
}

function getTextForPayImmediately(claim: Claim, lang: string) {
  const date = claim.claimantResponse.suggestedImmediatePaymentDeadLine;
  return {
    agreementText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.THE_AGREEMENT.PAY_IMMEDIATELY_PLAN', {
      lng: lang,
      defendant: claim.getDefendantFullName(),
      amount: getAmount(claim),
      claimant: claim.getClaimantFullName(),
      paymentDate: formatDateToFullDate(date, lang),
    }),
    completionDateText: t('PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.COMPLETION_DATE.DATE', { finalRepaymentDate: formatDateToFullDate(date, lang) }),
  };
}
