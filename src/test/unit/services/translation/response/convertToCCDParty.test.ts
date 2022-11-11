import {Party} from '../../../../../main/common/models/party';
import {toCCDParty} from '../../../../../main/services/translation/response/convertToCCDParty';
import {PartyType} from '../../../../../main/common/models/partyType';
import {ResponseType} from '../../../../../main/common/form/models/responseType';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {Address} from '../../../../../main/common/form/models/address';
import {CCDParty} from '../../../../../main/common/models/ccdResponse/ccdParty';
import {CCDAddress} from '../../../../../main/common/models/ccdResponse/ccdAddress';
import {DateOfBirth} from '../../../../../main/common/form/models/claim/claimant/dateOfBirth';
import {PartyPhone} from '../../../../../main/common/models/PartyPhone';
import {Email} from '../../../../../main/common/models/Email';

const companyName = 'Version 1';
const phone = new PartyPhone('123456789');
const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const soleTraderTradingAs = 'test';
const dateOfBirth = new DateOfBirth('10','10','1990');
const email = new Email('test@test.com');
const emailCCD = 'test@test.com';

const address: Address = new Address('Street test','1', '1A', 'test', 'sl11gf');

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
  contactPerson: 'Contact person test',
  postToThisAddress: YesNo.NO,
};

const partyCompany: Party = {
  type: PartyType.COMPANY,
  partyPhone: phone,
  responseType: ResponseType.PART_ADMISSION,
  emailAddress: email,
  partyDetails: {
    partyName: companyName,
    ...commonParty,
  },
};

const partyOrganisation: Party = {
  type: PartyType.ORGANISATION,
  partyPhone: phone,
  responseType: ResponseType.PART_ADMISSION,
  emailAddress: email,
  partyDetails: {
    partyName: companyName,
    ...commonParty,
  },
};

const partyIndividual: Party = {
  type: PartyType.INDIVIDUAL,
  partyPhone: phone,
  responseType: ResponseType.PART_ADMISSION,
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
  responseType: ResponseType.PART_ADMISSION,
  emailAddress: email,
  partyDetails: {
    individualTitle: title,
    individualFirstName: firstName,
    individualLastName: lastName,
    soleTraderTradingAs: soleTraderTradingAs,
    ...commonParty,
  },
  dateOfBirth: dateOfBirth,
  ...commonParty,
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
  individualDateOfBirth: new Date('10/10/1990').toLocaleDateString(),
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
  soleTraderDateOfBirth: new Date('10/10/1990').toLocaleDateString(),
  soleTraderTitle: title,
  soleTraderFirstName: firstName,
  soleTraderLastName: lastName,
  soleTraderTradingAs: soleTraderTradingAs,
  type: PartyType.SOLE_TRADER,
};

describe('translate party to ccd model', () => {
  it('should translate COMPANY party to ccd', () => {
    //Given
    const party = partyCompany;
    //When
    const partyResponseCCD = toCCDParty(party);
    //Then
    expect(partyResponseCCD).toMatchObject(partyCompanyCCD);
  });

  it('should translate ORGANISATION party to ccd', () => {
    //Given
    const party = partyOrganisation;
    const partyOrganisationCCD: CCDParty = {
      ...partyCompanyCCD,
      organisationName: companyName,
      companyName: undefined,
      type: PartyType.ORGANISATION,
    };
    //When
    const partyResponseCCD = toCCDParty(party);
    //Then
    expect(partyResponseCCD).toMatchObject(partyOrganisationCCD);
  });

  it('should translate INDIVIDUAL party to ccd', () => {
    //Given
    const party = partyIndividual;
    //When
    const partyResponseCCD = toCCDParty(party);
    //Then
    expect(partyResponseCCD).toMatchObject(partyIndividualCCD);
  });

  it('should translate SOLE TRADER party to ccd', () => {
    //Given
    const party = partySoleTrader;
    //When
    const partyResponseCCD = toCCDParty(party);
    //Then
    expect(partyResponseCCD).toMatchObject(partySoleTraderCCD);
  });

});
