import {CCDParty} from 'models/ccdResponse/ccdParty';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {toCCDAddress} from './convertToCCDAddress';
import {DateTime} from 'luxon';

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party?.type === PartyType.COMPANY ? party?.partyDetails?.partyName : undefined,
    individualDateOfBirth: party?.type === PartyType.INDIVIDUAL ? getStringDate(party) : null,
    individualFirstName: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualFirstName : undefined,
    individualLastName: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualLastName : undefined,
    individualTitle: party?.type === PartyType.INDIVIDUAL ? party?.partyDetails?.individualTitle : undefined,
    organisationName: party?.type === PartyType.ORGANISATION ? party?.partyDetails?.partyName : undefined,
    partyEmail: party?.emailAddress?.emailAddress,
    partyPhone: party?.partyPhone?.phone,
    primaryAddress: toCCDAddress(party?.partyDetails?.primaryAddress),
    soleTraderDateOfBirth: party?.type === PartyType.SOLE_TRADER ?  getStringDate(party) : null,
    soleTraderFirstName: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualFirstName : undefined,
    soleTraderLastName: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualLastName : undefined,
    soleTraderTitle: party?.type === PartyType.SOLE_TRADER ? party?.partyDetails?.individualTitle : undefined,
    soleTraderTradingAs: party?.partyDetails?.soleTraderTradingAs,
    type: party?.type,
  };
};
const getStringDate=(party: Party): string=> {
  if (party?.dateOfBirth) {
    return DateTime.fromJSDate(new Date(party.dateOfBirth as unknown as string)).toFormat('yyyy-MM-dd');
  }
  return null;
}
