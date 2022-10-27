import {CCDParty} from "../../../common/models/ccdResponse/ccdParty";
import {Party} from "../../../common/models/party";
import {PartyType} from "../../../common/models/partyType";

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
    partyPhone: party.phoneNumber,
    // partyTypeDisplayValue: generateDisplayValueByPartyType(party.type), // is this a value calculated in civil-service?
    primaryAddress: {
      AddressLine1: party.primaryAddress.AddressLine1,
      AddressLine2: party.primaryAddress.AddressLine2,
      AddressLine3: party.primaryAddress.AddressLine3,
      Country: party.primaryAddress.Country,
      County: party.primaryAddress.County,
      PostCode: party.primaryAddress.PostCode,
      PostTown: party.primaryAddress.PostTown
    },
    soleTraderDateOfBirth: party.type === PartyType.SOLE_TRADER ? party.dateOfBirth.toDateString() : null,
    soleTraderFirstName: party.type === PartyType.SOLE_TRADER ? party.individualFirstName : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderLastName: party.type === PartyType.SOLE_TRADER ? party.individualLastName : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTitle: party.type === PartyType.SOLE_TRADER ? party.individualTitle : null, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTradingAs: party.soleTraderTradingAs,
    type: party.type
  };
};
