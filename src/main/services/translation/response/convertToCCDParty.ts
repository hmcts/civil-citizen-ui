import {CCDParty} from "../../../common/models/ccdResponse/ccdParty";
import {Party} from "../../../common/models/party";
import {PartyType} from "../../../common/models/partyType";
import {toCCDAddress} from "./convertToCCDAddress";

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party.type === PartyType.COMPANY ? party.partyName : null,
    individualDateOfBirth: party.type === PartyType.INDIVIDUAL ? party.dateOfBirth.toString() : null,
    individualFirstName: party.type === PartyType.INDIVIDUAL ? party.individualFirstName : null,
    individualLastName: party.type === PartyType.INDIVIDUAL ? party.individualLastName : null,
    individualTitle: party.type === PartyType.INDIVIDUAL ? party.individualTitle : null,
    organisationName: party.type === PartyType.ORGANISATION ? party.partyName : null,
    partyEmail: party.emailAddress,
    partyPhone: party.partyPhone,
    primaryAddress: toCCDAddress(party.primaryAddress),
    soleTraderDateOfBirth: party.type === PartyType.SOLE_TRADER ? party.dateOfBirth.toString() : null,
    soleTraderFirstName: party.type === PartyType.SOLE_TRADER ? party.individualFirstName : null,
    soleTraderLastName: party.type === PartyType.SOLE_TRADER ? party.individualLastName : null,
    soleTraderTitle: party.type === PartyType.SOLE_TRADER ? party.individualTitle : null,
    soleTraderTradingAs: party.soleTraderTradingAs,
    type: party.type
  };
};
