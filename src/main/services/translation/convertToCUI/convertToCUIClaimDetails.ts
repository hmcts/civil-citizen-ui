import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';
import {CCDClaim} from 'models/civilClaimResponse';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';
import { PaymentInformation } from 'common/models/feePayment/paymentInformation';

export const toCUIClaimDetails = (ccdClaim: CCDClaim): ClaimDetails => {
  if (!ccdClaim) return undefined;
  const claimDetails: ClaimDetails = new ClaimDetails();
  claimDetails.reason = new Reason(ccdClaim.detailsOfClaim);
  claimDetails.helpWithFees = new HelpWithFees(toCUIYesNo(ccdClaim?.helpWithFees?.helpWithFee), ccdClaim?.helpWithFees?.helpWithFeesReferenceNumber);
  claimDetails.claimFeePayment = new PaymentInformation('', ccdClaim?.claimIssuedPaymentDetails?.reference, ccdClaim?.claimIssuedPaymentDetails?.status);
  //TODO: Add all other translations for the claimDetails fields
  return claimDetails;
};

