import {RejectAllOfClaimType} from "form/models/rejectAllOfClaimType";
import {CCDRejectAllOfClaimType} from "models/ccdResponse/ccdRejectAllOfClaimType";

export const toCCDRejectAllOfClaimType = (option: string): string => {
  if (option == RejectAllOfClaimType.ALREADY_PAID) {
    return CCDRejectAllOfClaimType.HAS_PAID_THE_AMOUNT_CLAIMED;
  } else if (option == RejectAllOfClaimType.DISPUTE) {
    return CCDRejectAllOfClaimType.DISPUTES_THE_CLAIM;
  }
};
