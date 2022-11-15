import {CCDParty} from 'models/ccdResponse/ccdParty';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {Address} from 'form/models/address';
import {PartyPhone} from 'models/PartyPhone';
import {Email} from 'models/Email';

export const toCUIParty = (ccdParty: CCDParty): Party => {
  const cuiParty = new Party();
  cuiParty.partyDetails = new PartyDetails({});
  if (ccdParty.type === PartyType.INDIVIDUAL) {
    cuiParty.partyDetails.individualFirstName = ccdParty.individualFirstName ? ccdParty?.individualFirstName : undefined;
    cuiParty.partyDetails.individualLastName = ccdParty.individualLastName ? ccdParty?.individualLastName : undefined;
    cuiParty.partyDetails.individualTitle = ccdParty.individualTitle ? ccdParty?.individualTitle : undefined;
    cuiParty.dateOfBirth.date = ccdParty.individualDateOfBirth ? new Date(ccdParty?.individualDateOfBirth) : undefined;
  } else if (ccdParty.type === PartyType.SOLE_TRADER) {
    cuiParty.partyDetails.individualFirstName = ccdParty.soleTraderFirstName ? ccdParty?.soleTraderFirstName : undefined;
    cuiParty.partyDetails.individualLastName = ccdParty.soleTraderLastName ? ccdParty?.soleTraderLastName : undefined;
    cuiParty.partyDetails.individualTitle = ccdParty.soleTraderTitle ? ccdParty?.soleTraderTitle : undefined;
    cuiParty.dateOfBirth.date = ccdParty.soleTraderDateOfBirth ? new Date(ccdParty?.soleTraderDateOfBirth) : undefined;
    cuiParty.partyDetails.soleTraderTradingAs = ccdParty.soleTraderTradingAs ? ccdParty?.soleTraderTradingAs : undefined;
  } else if (ccdParty.type === PartyType.COMPANY) {
    cuiParty.partyDetails.partyName = ccdParty.companyName ? ccdParty?.companyName : undefined;
  } else {
    cuiParty.partyDetails.partyName = ccdParty.organisationName ? ccdParty?.organisationName : undefined;
  }

  cuiParty.partyPhone = ccdParty.partyPhone ? new PartyPhone(ccdParty?.partyPhone) : undefined;
  cuiParty.emailAddress = ccdParty.partyEmail ? new Email(ccdParty?.partyEmail) : undefined;
  cuiParty.type = ccdParty.type ? ccdParty?.type : undefined;
  cuiParty.partyDetails.primaryAddress = new Address(ccdParty.primaryAddress.AddressLine1, ccdParty.primaryAddress.AddressLine2, ccdParty.primaryAddress.AddressLine3, ccdParty.primaryAddress.PostTown, ccdParty.primaryAddress.PostCode);
  console.log(cuiParty);
  return cuiParty;
};
