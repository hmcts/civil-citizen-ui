import {Party} from '../../../../../main/common/models/party';
import {toCUIParty} from '../../../../../main/services/translation/convertToCUI/convertToCUIParty';
import {PartyType} from '../../../../../main/common/models/partyType';
import {Address} from '../../../../../main/common/form/models/address';
import {CCDParty} from '../../../../../main/common/models/ccdResponse/ccdParty';
import {CCDAddress} from '../../../../../main/common/models/ccdResponse/ccdAddress';
import {CitizenDate} from '../../../../../main/common/form/models/claim/claimant/citizenDate';
import {PartyPhone} from '../../../../../main/common/models/PartyPhone';
import {Email} from '../../../../../main/common/models/Email';

const companyName = 'Version 1';
const phone = new PartyPhone('123456789');
const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const soleTraderTradingAs = 'test';
const dateOfBirth = new CitizenDate('20', '10', '1990');
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
  dateOfBirth: dateOfBirth,
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
  dateOfBirth: dateOfBirth,
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
  individualDateOfBirth: new Date('1990-10-20'),
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
  soleTraderDateOfBirth: new Date('1990-10-20'),
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
