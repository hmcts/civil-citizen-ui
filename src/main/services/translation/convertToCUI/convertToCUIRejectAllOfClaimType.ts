import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CCDRejectAllOfClaimType} from 'models/ccdResponse/ccdRejectAllOfClaimType';

export const toCUIRejectAllOfClaimType = (option: string): string => {
  if (option == CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED) {
    return RejectAllOfClaimType.ALREADY_PAID;
  } else if (option == CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM) {
    return RejectAllOfClaimType.DISPUTE;
  } else {
    return undefined;
  }
};
