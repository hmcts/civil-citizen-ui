import {Claim} from 'models/claim';
import {Address} from 'form/models/address';
import {Party} from 'models/party';

const getAddress = (party: Party): Address => {
  if (party.partyDetails?.correspondenceAddress?.addressLine1) {
    return party.partyDetails.correspondenceAddress;
  }
  return party?.partyDetails.primaryAddress;
};

const getSolicitorName = (claim: Claim): string => {
  return claim?.applicantSolicitor1ClaimStatementOfTruth ? claim.applicantSolicitor1ClaimStatementOfTruth.name : claim.claimDetails?.statementOfTruth?.signerName;
};

export {
  getAddress,
  getSolicitorName,
};
