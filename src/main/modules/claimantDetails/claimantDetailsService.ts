import {Claim} from '../../common/models/claim';

const getAddress = (claim: Claim) => {
  if (claim.specApplicantCorrespondenceAddressdetails?.AddressLine1) {
    console.log('claimant correspondence address');
    console.log(claim.specApplicantCorrespondenceAddressdetails);
    return claim.specApplicantCorrespondenceAddressdetails;
  }
  return claim.applicant1?.primaryAddress;
};

export {
  getAddress,
};
