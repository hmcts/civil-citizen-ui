import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';
import {CCDClaim} from 'models/civilClaimResponse';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';

export const toCUIClaimDetails = (ccdClaim: CCDClaim): ClaimDetails => {
  if (!ccdClaim) return undefined;
  const claimDetails: ClaimDetails = new ClaimDetails();
  claimDetails.reason = new Reason(ccdClaim.detailsOfClaim);
  claimDetails.helpWithFees = new HelpWithFees(ccdClaim?.helpWithFees?.helpWithFee, ccdClaim?.helpWithFees?.helpWithFeesReferenceNumber);
  //TODO: Add all other translations for the claimDetails fields
  return claimDetails;
};
