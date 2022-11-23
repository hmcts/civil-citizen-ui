import {Party} from 'common/models/party';
import {toCUIParty} from 'services/translation/response/convertToCUI/convertToCUIParty';
import {PartyType} from 'common/models/partyType';
import {Address} from 'common/form/models/address';
import {CCDParty} from 'common/models/ccdResponse/ccdParty';
import {CCDAddress} from 'common/models/ccdResponse/ccdAddress';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {PartyPhone} from 'common/models/PartyPhone';
import {Email} from 'common/models/Email';

const companyName = 'Version 1';
const phone = new PartyPhone('123456789');
const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const soleTraderTradingAs = 'test';
const dateOfBirth = new CitizenDate('10', '10', '1990');
const email = new Email('test@test.com');
const emailCCD = 'test@test.com';

const address: Address = new Address('Street test', '1', '1A', 'test', 'sl11gf');

const addressCCD: CCDAddress = {
  AddressLine1: 'Street test',
  AddressLine2: '1',
  AddressLine3: '1A',
  PostTown: 'test',
  PostCode: 'sl11gf',
  Country: 'test',
  County: 'test',
};

const commonParty = {
  primaryAddress: address,
};

const partyCompany: Party = {
  type: PartyType.COMPANY,
  partyPhone: phone,
  emailAddress: email,
  partyDetails: {
    partyName: companyName,
    ...commonParty,
  },
};

const partyIndividual: Party = {
  type: PartyType.INDIVIDUAL,
  partyPhone: phone,
  emailAddress: email,
  partyDetails: {
    individualTitle: title,
    individualFirstName: firstName,
    individualLastName: lastName,
    ...commonParty,
  },
  dateOfBirth: {date: dateOfBirth.date, year: NaN, month: NaN, day: NaN},
};

const partySoleTrader: Party = {
  type: PartyType.SOLE_TRADER,
  partyPhone: phone,
  emailAddress: email,
  partyDetails: {
    individualTitle: title,
    individualFirstName: firstName,
    individualLastName: lastName,
    soleTraderTradingAs: soleTraderTradingAs,
    ...commonParty,
  },
  dateOfBirth: {date: dateOfBirth.date, year: NaN, month: NaN, day: NaN},
};

const partyCompanyCCD: CCDParty = {
  companyName: companyName,
  individualDateOfBirth: undefined,
  individualFirstName: undefined,
  individualLastName: undefined,
  individualTitle: undefined,
  organisationName: undefined,
  partyEmail: emailCCD,
  partyPhone: phoneCCD,
  primaryAddress: addressCCD,
  soleTraderDateOfBirth: undefined,
  soleTraderFirstName: undefined,
  soleTraderLastName: undefined,
  soleTraderTitle: undefined,
  soleTraderTradingAs: undefined,
  type: PartyType.COMPANY,
};

const partyIndividualCCD: CCDParty = {
  companyName: undefined,
  individualDateOfBirth: new Date('Wed Oct 10 1990 01:00:00 GMT+0100').toLocaleString(),
  individualTitle: title,
  individualFirstName: firstName,
  individualLastName: lastName,
  organisationName: undefined,
  partyEmail: emailCCD,
  partyPhone: phoneCCD,
  primaryAddress: addressCCD,
  soleTraderDateOfBirth: undefined,
  soleTraderTitle: undefined,
  soleTraderFirstName: undefined,
  soleTraderLastName: undefined,
  soleTraderTradingAs: undefined,
  type: PartyType.INDIVIDUAL,
};

const partySoleTraderCCD: CCDParty = {
  companyName: undefined,
  individualDateOfBirth: undefined,
  individualFirstName: undefined,
  individualLastName: undefined,
  individualTitle: undefined,
  organisationName: undefined,
  partyEmail: emailCCD,
  partyPhone: phoneCCD,
  primaryAddress: addressCCD,
  soleTraderDateOfBirth: new Date('Wed Oct 10 1990 01:00:00 GMT+0100').toLocaleString(),
  soleTraderTitle: title,
  soleTraderFirstName: firstName,
  soleTraderLastName: lastName,
  soleTraderTradingAs: soleTraderTradingAs,
  type: PartyType.SOLE_TRADER,
};

describe('translate party to cui model', () => {
  it('should translate COMPANY party to ccd', () => {
    const partyResponseCCD = toCUIParty(partyCompanyCCD);
    expect(partyResponseCCD).toMatchObject(partyCompany);
  });

  it('should translate INDIVIDUAL party to cui', () => {
    const partyResponse = toCUIParty(partyIndividualCCD);
    expect(partyResponse).toMatchObject(partyIndividual);
  });

  it('should translate SOLE TRADER party to cui', () => {
    const partyResponse = toCUIParty(partySoleTraderCCD);
    expect(partyResponse).toMatchObject(partySoleTrader);
  });
});
