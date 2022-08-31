import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/CCDResponse';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/paymentOptionCCD';

export const translateDraftResponseToCCD = (claim: Claim): CCDResponse => {
  return {
    paymentTypeSelection : toCCDPaymentOption(claim.paymentOption),
  };
};
