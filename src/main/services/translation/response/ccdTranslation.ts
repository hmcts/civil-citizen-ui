import {Claim} from '../../../common/models/claim';
import {CCDResponse} from '../../../common/models/ccdResponse/CCDResponse';
import {toCCDPaymentOption} from '../../../common/models/ccdResponse/paymentOptionCCD';

export const translateDraftResponseToCCD = (claim: Claim): CCDResponse => {
  return {
    respondent1: claim.respondent1,
    paymentTypeSelection : toCCDPaymentOption(claim.paymentOption),
  };
};
