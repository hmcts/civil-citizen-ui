import {Party} from 'common/models/party';
import {toCCDParty} from 'services/translation/response/convertToCCDParty';
import {PartyType} from 'common/models/partyType';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo} from 'common/form/models/yesNo';
import {Address} from 'common/form/models/address';
import {CCDParty} from 'common/models/ccdResponse/ccdParty';
import {CCDAddress} from 'common/models/ccdResponse/ccdAddress';
import {PartyPhone} from 'common/models/PartyPhone';
import {req} from '../../../../utils/UserDetails';
import {Email} from 'models/Email';

const companyName = 'Version 1';
const phone = new PartyPhone('123456789');
const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const soleTraderTradingAs = 'test';
const email = new Email(req.session.user.email);
const emailCCD = req.session.user.email;

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
  individualDateOfBirth: undefined,
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
  soleTraderDateOfBirth: undefined,
  soleTraderTitle: title,
  soleTraderFirstName: firstName,
  soleTraderLastName: lastName,
  soleTraderTradingAs: soleTraderTradingAs,
  type: PartyType.SOLE_TRADER,
};

describe('translate party to ccd model', () => {
  it('should translate COMPANY party to ccd', () => {
    const partyResponseCCD = toCCDParty(partyCompany);
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

    const partyResponseCCD = toCCDParty(party);
    expect(partyResponseCCD).toMatchObject(partyOrganisationCCD);
  });

  it('should translate INDIVIDUAL party to ccd', () => {
    const partyResponseCCD = toCCDParty(partyIndividual);
    expect(partyResponseCCD).toMatchObject(partyIndividualCCD);
  });

  it('should translate INDIVIDUAL party to ccd with applicantEmail', () => {
    const partyResponseCCD = toCCDParty(partyIndividual);
    expect(partyResponseCCD).toMatchObject({...partyIndividualCCD, partyEmail: req.session.user.email });
  });

  it('should translate SOLE TRADER party to ccd', () => {
    const partyResponseCCD = toCCDParty(partySoleTrader);
    expect(partyResponseCCD).toMatchObject(partySoleTraderCCD);
  });
});
