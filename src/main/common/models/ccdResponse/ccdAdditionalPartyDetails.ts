import {Address} from 'form/models/address';
import {Party} from 'models/party';

export interface CCDAdditionalPartyDetails {
  correspondenceAddress?: Address,
  contactPerson?: string,
}

export const toAdditionalPartyDetails = (party: Party) => {
  if (!party) return undefined;
  return {
    correspondenceAddress: party.partyDetails?.correspondenceAddress,
    contactPerson: party.partyDetails?.contactPerson,
  };

};
