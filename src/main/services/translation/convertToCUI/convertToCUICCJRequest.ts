import {CCDClaim} from 'models/civilClaimResponse';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {YesNo} from 'form/models/yesNo';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {convertToPound} from 'services/translation/claim/moneyConversation';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {CCDClaimantPaymentOption} from 'models/ccdResponse/ccdClaimantPaymentOption';

export const toCUICCJRequest = (ccdClaim: CCDClaim): CCJRequest => {
  const ccjRequest: CCJRequest = new CCJRequest();
  const paidAmount: PaidAmount = new PaidAmount();
  paidAmount.option = toCUIYesNo(ccdClaim.partialPayment);
  if (paidAmount.option === YesNo.YES)
    paidAmount.amount = convertToPound(Number(ccdClaim.partialPaymentAmount));
  ccjRequest.ccjPaymentOption = new CcjPaymentOption(toCUIPaymentOption(ccdClaim.paymentTypeSelection));
  ccjRequest.paidAmount = paidAmount;
  return ccjRequest;

};

const toCUIPaymentOption = (paymentOptionType: CCDDJPaymentOption) : PaymentOptionType => {
  switch(paymentOptionType) {
    case CCDDJPaymentOption.REPAYMENT_PLAN:
      return PaymentOptionType.INSTALMENTS;
    case CCDDJPaymentOption.SET_DATE:
      return PaymentOptionType.BY_SET_DATE;
    case CCDDJPaymentOption.IMMEDIATELY:
      return PaymentOptionType.IMMEDIATELY;
    default: return undefined;
  }
};

export const toCUIClaimantPaymentOption = (paymentOptionType: CCDClaimantPaymentOption) : PaymentOptionType => {
  switch(paymentOptionType) {
    case CCDClaimantPaymentOption.REPAYMENT_PLAN:
      return PaymentOptionType.INSTALMENTS;
    case CCDClaimantPaymentOption.SET_DATE:
      return PaymentOptionType.BY_SET_DATE;
    case CCDClaimantPaymentOption.IMMEDIATELY:
      return PaymentOptionType.IMMEDIATELY;
    default: return undefined;
  }
};
