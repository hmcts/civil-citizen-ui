import {ClaimDetails} from '../../../common/form/models/claim/details/claimDetails';
import {Reason} from '../../../common/form/models/claim/details/reason';
import {CCDClaim} from '../../../common/models/civilClaimResponse';

export const toCUIClaimDetails = (ccdClaim: CCDClaim): ClaimDetails => {
  if (!ccdClaim) return undefined;
  const claimDetails: ClaimDetails = new ClaimDetails();
  claimDetails.reason = new Reason(ccdClaim.detailsOfClaim);
  //TODO: Add all other translations for the claimDetails fields
  return claimDetails;
};
