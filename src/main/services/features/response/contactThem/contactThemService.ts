import {Claim} from 'models/claim';
import {Address} from 'form/models/address';
import {Party} from 'models/party';
import {toCUIAddress} from 'services/translation/convertToCUI/convertToCUIAddress';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const getAddress = (party: Party): Address => {
  if (party.partyDetails?.correspondenceAddress?.addressLine1) {
    return party.partyDetails.correspondenceAddress;
  }
  return party?.partyDetails.primaryAddress;
};

const getSolicitorName = (claim: Claim): string => {
  return claim?.applicantSolicitor1ClaimStatementOfTruth ? claim.applicantSolicitor1ClaimStatementOfTruth.name : claim.claimDetails?.statementOfTruth?.signerName;
};

const getRespondentSolicitorAddress = (claim: Claim): Address => {
  if (claim.specRespondentCorrespondenceAddressRequired === YesNoUpperCamelCase.YES) {
    return toCUIAddress(claim.specRespondentCorrespondenceAddressdetails);
  }
  return toCUIAddress(claim.respondentSolDetails.address);
};

export {
  getAddress,
  getSolicitorName,
  getRespondentSolicitorAddress,
};
