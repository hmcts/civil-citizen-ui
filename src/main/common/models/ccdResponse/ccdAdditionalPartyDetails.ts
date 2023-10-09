import {Party} from 'models/party';
import {toCCDAddress} from 'services/translation/response/convertToCCDAddress';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';

export interface CCDAdditionalPartyDetails {
  correspondenceAddress?: CCDAddress,
  contactPerson?: string,
}

export const toAdditionalPartyDetails = (party: Party) => {
  if (!party) return undefined;
  return {
    correspondenceAddress: toCCDAddress(party.partyDetails?.correspondenceAddress),
    contactPerson: party.partyDetails?.contactPerson,
  };

};
