import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {CCDRejectAllOfClaimType} from 'models/ccdResponse/ccdRejectAllOfClaimType';

export const toCUIRejectAllOfClaimType = (option: string): string => {
  switch (option) {
    case CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED:
      return RejectAllOfClaimType.ALREADY_PAID;
    case CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM:
      return RejectAllOfClaimType.DISPUTE;
    default:
      return undefined;
  }
};
