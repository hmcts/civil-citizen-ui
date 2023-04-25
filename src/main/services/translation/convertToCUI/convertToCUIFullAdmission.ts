import {CCDClaim} from "models/civilClaimResponse";
import {FullAdmission} from "models/fullAdmission";
import {toCUIPaymentIntention} from "services/translation/convertToCUI/convertToCUIPaymentIntention";

export const toCUIFullAdmission = (ccdClaim: CCDClaim): FullAdmission => {
  if(!ccdClaim) return undefined;
  const fa: FullAdmission = new FullAdmission();
  fa.paymentIntention = toCUIPaymentIntention(ccdClaim);
  return fa;
}
