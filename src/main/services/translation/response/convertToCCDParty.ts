import {CCDParty} from "../../../common/models/ccdResponse/ccdParty";
import {Party} from "../../../common/models/party";
import {PartyType} from "../../../common/models/partyType";
import {toCCDAddress} from "./convertToCCDAddress";

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party?.type === PartyType.COMPANY ? party?.partyName : undefined,
    individualDateOfBirth: party?.type === PartyType.INDIVIDUAL ? party?.dateOfBirth.toString() : undefined,
    individualFirstName: party?.type === PartyType.INDIVIDUAL ? party?.individualFirstName : undefined,
    individualLastName: party?.type === PartyType.INDIVIDUAL ? party?.individualLastName : undefined,
    individualTitle: party?.type === PartyType.INDIVIDUAL ? party?.individualTitle : undefined,
    organisationName: party?.type === PartyType.ORGANISATION ? party?.partyName : undefined,
    partyEmail: party?.emailAddress,
    partyPhone: party?.partyPhone,
    primaryAddress: toCCDAddress(party?.primaryAddress),
    soleTraderDateOfBirth: party?.type === PartyType.SOLE_TRADER ? party?.dateOfBirth.toString() : undefined,
    soleTraderFirstName: party?.type === PartyType.SOLE_TRADER ? party?.individualFirstName : undefined,
    soleTraderLastName: party?.type === PartyType.SOLE_TRADER ? party?.individualLastName : undefined,
    soleTraderTitle: party?.type === PartyType.SOLE_TRADER ? party?.individualTitle : undefined,
    soleTraderTradingAs: party?.soleTraderTradingAs,
    type: party?.type
  };
};
