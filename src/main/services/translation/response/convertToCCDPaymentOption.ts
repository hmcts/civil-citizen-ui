import {PaymentOptionType} from '../../../common/form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from '../../../common/models/ccdResponse/ccdPaymentOption';
import {Claim} from "models/claim";
import {ResponseType} from "form/models/responseType";

export const toCCDPaymentOption = (claim: Claim) : CCDPaymentOption => {
  let paymentOptionType

  switch(claim.respondent1?.responseType) {
    case ResponseType.PART_ADMISSION:
      paymentOptionType = claim.partialAdmission.paymentIntention.paymentOption;
      break;
    case ResponseType.FULL_ADMISSION:
      paymentOptionType = claim.fullAdmission.paymentIntention.paymentOption;
      break;
    default:
      paymentOptionType = undefined;
  }

  logger.info('payment type 2' + paymentOptionType)

  switch(paymentOptionType) {
    case PaymentOptionType.INSTALMENTS:
      return CCDPaymentOption.REPAYMENT_PLAN;
    case PaymentOptionType.BY_SET_DATE:
      return CCDPaymentOption.BY_SET_DATE;
    default: return CCDPaymentOption.IMMEDIATELY;
  }
};
