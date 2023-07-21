import {YesNo} from 'common/form/models/yesNo';
import {ClaimDetails} from '../../../common/form/models/claim/details/claimDetails';
import {Reason} from '../../../common/form/models/claim/details/reason';
import {CCDClaim} from '../../../common/models/civilClaimResponse';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';

export const toCUIClaimDetails = (ccdClaim: CCDClaim): ClaimDetails => {
  if (!ccdClaim) return undefined;
  const claimDetails: ClaimDetails = new ClaimDetails();
  claimDetails.reason = new Reason(ccdClaim.detailsOfClaim);
  if (ccdClaim?.respondent1LiPResponse?.helpWithFeesReferenceNumberLip) {
    claimDetails.helpWithFees = new HelpWithFees(YesNo.YES, ccdClaim.respondent1LiPResponse.helpWithFeesReferenceNumberLip)
  } else {
    claimDetails.helpWithFees = new HelpWithFees(YesNo.NO);
  }
  //TODO: Add all other translations for the claimDetails fields
  return claimDetails;
};
