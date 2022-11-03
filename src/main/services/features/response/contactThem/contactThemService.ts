import {Claim} from '../../../../common/models/claim';
import {Address} from '../../../../common/form/models/address';

const getAddress = (claim: Claim): Address => {
  if (claim.applicant1.partyDetails.primaryAddress.addressLine1) {
    return claim.applicant1.partyDetails.primaryAddress;
  } else if (claim.applicant1.partyDetails.correspondenceAddress.addressLine1) {
    return claim.applicant1.partyDetails.correspondenceAddress;
  }
  return claim.applicant1?.partyDetails.primaryAddress;
};

const getSolicitorName = (claim: Claim): string => {
  return claim.applicantSolicitor1ClaimStatementOfTruth?.name;
};

export {
  getAddress,
  getSolicitorName,
};
