import {PartyType} from "../partyType"

export interface CCDParty {
    companyName: string,
    individualDateOfBirth: string,
    individualFirstName: string,
    individualLastName: string,
    individualTitle: string,
    organisationName: string,
    partyEmail: string,
    partyName?: string,
    partyPhone: string,
    partyTypeDisplayValue?: string,
    primaryAddress: {
      AddressLine1: string,
      AddressLine2: string,
      AddressLine3: string,
      Country: string,
      County: string,
      PostCode: string,
      PostTown: string
    },
    soleTraderDateOfBirth: string,
    soleTraderFirstName: string,
    soleTraderLastName: string,
    soleTraderTitle: string,
    soleTraderTradingAs: string,
    type: PartyType,
}
