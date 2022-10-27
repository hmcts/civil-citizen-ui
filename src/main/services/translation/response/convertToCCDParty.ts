import {CCDParty} from "../../../common/models/ccdResponse/ccdParty";
import {Party} from "../../../common/models/party";
import {PartyType} from "../../../common/models/partyType";
import { toCCDAddress } from "./convertToCCDAddress";

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party.type === PartyType.COMPANY ? party.partyName : null,
    individualDateOfBirth: party.type === PartyType.INDIVIDUAL ? party.dateOfBirth.toDateString() : null,
    individualFirstName: party.type === PartyType.INDIVIDUAL ? party.individualFirstName : null,
    individualLastName: party.type === PartyType.INDIVIDUAL ? party.individualLastName : null,
    individualTitle: party.type === PartyType.INDIVIDUAL ? party.individualTitle : null,
    organisationName: party.type === PartyType.ORGANISATION ? party.partyName : null,
    partyEmail: party.emailAddress,
    partyName: party.partyName, // TODO: delete? civil-service call getPartyName() but we use it as organisation name
    partyPhone: party.partyPhone,
    // partyTypeDisplayValue: generateDisplayValueByPartyType(party.type), // is this a value calculated in civil-service?
    primaryAddress: toCCDAddress(party.primaryAddress),
    soleTraderDateOfBirth: party.type === PartyType.SOLE_TRADER ? party.dateOfBirth.toDateString() : null,
    soleTraderFirstName: party.type === PartyType.SOLE_TRADER ? party.individualFirstName : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderLastName: party.type === PartyType.SOLE_TRADER ? party.individualLastName : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTitle: party.type === PartyType.SOLE_TRADER ? party.individualTitle : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTradingAs: party.soleTraderTradingAs,
    type: party.type
  };
};
