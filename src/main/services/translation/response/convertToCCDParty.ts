import {CCDParty} from '../../../common/models/ccdResponse/ccdParty';
import {Party} from '../../../common/models/party';
import {PartyType} from '../../../common/models/partyType';
import {toCCDAddress} from './convertToCCDAddress';

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party?.type === PartyType.COMPANY ? party?.partyDetails?.partyName : undefined,
    individualDateOfBirth: party?.type === PartyType.INDIVIDUAL ? party?.dateOfBirth?.date.toString() : undefined,
    individualFirstName: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualFirstName : undefined,
    individualLastName: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualLastName : undefined,
    individualTitle: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualTitle : undefined,
    organisationName: party?.type === PartyType.ORGANISATION ? party?.partyDetails?.partyName : undefined,
    partyEmail: party?.emailAddress?.emailAddress,
    partyPhone: party?.partyPhone?.phone,
    primaryAddress: toCCDAddress(party?.partyDetails?.primaryAddress),
    soleTraderDateOfBirth: party?.type === PartyType.SOLE_TRADER ? party?.dateOfBirth?.date.toString() : undefined,
    soleTraderFirstName: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualFirstName : undefined,
    soleTraderLastName: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualLastName : undefined,
    soleTraderTitle: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualTitle : undefined,
    soleTraderTradingAs: party?.partyDetails?.soleTraderTradingAs,
    type: party?.type,
  };
};
