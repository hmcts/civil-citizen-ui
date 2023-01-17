import {Party} from 'models/party';
import {toCCDParty} from 'services/translation/response/convertToCCDParty';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {YesNo} from 'form/models/yesNo';
import {Address} from 'form/models/address';
import {CCDParty} from 'models/ccdResponse/ccdParty';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {PartyPhone} from 'models/PartyPhone';
import {Email} from 'models/Email';
import * as requestModels from 'models/AppRequest';

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};

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
  idamEmail: undefined,
  idamId: undefined,
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
  idamEmail: undefined,
  idamId: undefined,
  companyName: undefined,
  individualDateOfBirth: new Date('1990-10-10T00:00:00.000Z'),
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
  idamEmail: undefined,
  idamId: undefined,
  companyName: undefined,
  individualDateOfBirth: undefined,
  individualFirstName: undefined,
  individualLastName: undefined,
  individualTitle: undefined,
  organisationName: undefined,
  partyEmail: emailCCD,
  partyPhone: phoneCCD,
  primaryAddress: addressCCD,
  soleTraderDateOfBirth: new Date('1990-10-10T00:00:00.000Z'),
  soleTraderTitle: title,
  soleTraderFirstName: firstName,
  soleTraderLastName: lastName,
  soleTraderTradingAs: soleTraderTradingAs,
  type: PartyType.SOLE_TRADER,
};

describe('translate party to ccd model', () => {
  it('should translate COMPANY party to ccd', () => {
    const partyResponseCCD = toCCDParty(partyCompany, mockedAppRequest, true);
    expect(partyResponseCCD).toMatchObject(partyCompanyCCD);
  });

  it('should translate ORGANISATION party to ccd', () => {
    const party = partyOrganisation;
    const partyOrganisationCCD: CCDParty = {
      ...partyCompanyCCD,
      organisationName: companyName,
      companyName: undefined,
      type: PartyType.ORGANISATION,
    };

    const partyResponseCCD = toCCDParty(party, mockedAppRequest, true);
    expect(partyResponseCCD).toMatchObject(partyOrganisationCCD);
  });

  it('should translate INDIVIDUAL party to ccd', () => {
    const partyResponseCCD = toCCDParty(partyIndividual, mockedAppRequest, true);
    expect(partyResponseCCD).toMatchObject(partyIndividualCCD);
  });

  it('should translate SOLE TRADER party to ccd', () => {
    const partyResponseCCD = toCCDParty(partySoleTrader, mockedAppRequest, true);
    expect(partyResponseCCD).toMatchObject(partySoleTraderCCD);
  });
});
