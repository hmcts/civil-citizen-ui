import {CCDClaim} from 'models/civilClaimResponse';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {YesNo} from 'form/models/yesNo';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import {convertToPound} from 'services/translation/claim/moneyConversation';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDDJPaymentOption} from 'models/ccdResponse/ccdDJPaymentOption';
import {CcjPaymentOption} from 'form/models/claimantResponse/ccj/ccjPaymentOption';
import {CCDChoosesHowToProceed} from 'services/translation/claimantResponse/convertToCCDClaimantLiPResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';

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

export const toCUIChoosesHowToProceed = (option: CCDChoosesHowToProceed) : ChooseHowProceed => {
  switch(option) {
    case CCDChoosesHowToProceed.SIGN_A_SETTLEMENT_AGREEMENT:
      return ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
    case CCDChoosesHowToProceed.REQUEST_A_CCJ:
      return ChooseHowProceed.REQUEST_A_CCJ;
    default: return undefined;
  }
};
