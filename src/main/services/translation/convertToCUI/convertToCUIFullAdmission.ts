import {CCDClaim} from 'models/civilClaimResponse';
import {FullAdmission} from 'models/fullAdmission';
import {toCUIPaymentIntention} from 'services/translation/convertToCUI/convertToCUIPartialAdmission';

export const toCUIFullAdmission = (ccdClaim: CCDClaim): FullAdmission => {
  const fullAdmission: FullAdmission = new FullAdmission();
  fullAdmission.paymentIntention = toCUIPaymentIntention(ccdClaim);
  return fullAdmission;
};
