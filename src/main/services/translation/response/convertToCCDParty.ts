import { CCDParty } from "common/models/ccdResponse/ccdParty";
import { Party } from "common/models/party";
import { PartyType } from "common/models/partyType";

export const toCCDParty = (party: Party): CCDParty => {
  return {
    companyName: party.type === PartyType.COMPANY ? party.partyName : '',
    individualDateOfBirth: party.type === PartyType.INDIVIDUAL ? party.dateOfBirth.toDateString() : '',
    individualFirstName: party.individualFirstName,
    individualLastName: party.individualLastName,
    individualTitle: party.individualTitle,
    organisationName: party.type === PartyType.ORGANISATION ? party.partyName : '',
    partyEmail: party.emailAddress,
    partyName: party.partyName, // TODO: delete? civil-service call getPartyName() but we use it as organisation name
    partyPhone: party.phoneNumber,
    // partyTypeDisplayValue: generateDisplayValueByPartyType(party.type),
    primaryAddress: {
      AddressLine1: party.primaryAddress.AddressLine1,
      AddressLine2: party.primaryAddress.AddressLine2,
      AddressLine3: party.primaryAddress.AddressLine3,
      Country: party.primaryAddress.Country,
      County: party.primaryAddress.County,
      PostCode: party.primaryAddress.PostCode,
      PostTown: party.primaryAddress.PostTown
    },
    soleTraderDateOfBirth: party.type === PartyType.SOLE_TRADER ? party.dateOfBirth.toDateString() : '',
    soleTraderFirstName: party.soleTraderFirstName, // TODO: soleTraderFirstName is not used, use individual
    soleTraderLastName: party.soleTraderLastName, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTitle: party.soleTraderTitle, // TODO: soleTraderFirstName is not used, use individual
    soleTraderTradingAs: party.soleTraderTradingAs,
    type: party.type
  };
};