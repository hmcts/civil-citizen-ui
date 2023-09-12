import {Address} from 'form/models/address';
import {Claim} from 'models/claim';

export interface CCDAdditionalPartyDetails {
  correspondenceAddress?: Address,
  contactPerson?: string,
}

export const getAdditionalRespondentDetails = (claim: Claim) => {
  if (!claim.respondent1) return undefined;
  return {
    correspondenceAddress: claim.respondent1.partyDetails.correspondenceAddress,
    contactPerson: claim.respondent1.partyDetails.contactPerson,
  };

};
export const getAdditionalClaimantDetails = (claim: Claim) => {
  if (!claim.applicant1) return undefined;
  return {
    correspondenceAddress: claim.applicant1.partyDetails.correspondenceAddress,
    contactPerson: claim.applicant1.partyDetails.contactPerson,
  };
};
