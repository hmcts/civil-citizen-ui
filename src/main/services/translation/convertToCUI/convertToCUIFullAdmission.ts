import {CCDClaim} from 'models/civilClaimResponse';
import {FullAdmission} from 'models/fullAdmission';
import {toCUIPaymentIntention} from 'services/translation/convertToCUI/convertToCUIPartialAdmission';

export const toCUIFullAdmission = (ccdClaim: CCDClaim): FullAdmission => {
  const fa: FullAdmission = new FullAdmission();
  fa.paymentIntention = toCUIPaymentIntention(ccdClaim);
  return fa;
};
