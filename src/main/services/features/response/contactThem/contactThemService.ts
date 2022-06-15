import {Claim} from '../../../../common/models/claim';
import {CorrespondenceAddress} from '../../../../common/models/correspondenceAddress';

const getAddress = (claim: Claim): CorrespondenceAddress => {
  if (claim.applicantSolicitor1ServiceAddress?.AddressLine1) {
    return claim.applicantSolicitor1ServiceAddress;
  } else if (claim.specApplicantCorrespondenceAddressdetails?.AddressLine1) {
    return claim.specApplicantCorrespondenceAddressdetails;
  }
  return claim.applicant1?.primaryAddress;
};

const getSolicitorName = (claim: Claim): string => {
  return claim.applicantSolicitor1ClaimStatementOfTruth?.name;
};

export {
  getAddress,
  getSolicitorName,
};
