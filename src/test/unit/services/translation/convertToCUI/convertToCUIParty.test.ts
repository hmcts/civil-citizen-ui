import {Party} from 'models/party';
import {
  toCUIParty,
  toCUIPartyRespondent,
} from 'services/translation/convertToCUI/convertToCUIParty';
import {PartyType} from 'models/partyType';
import {Address} from 'form/models/address';
import {CCDParty} from 'models/ccdResponse/ccdParty';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {PartyPhone} from 'models/PartyPhone';
import {Email} from 'models/Email';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {YesNo} from 'form/models/yesNo';

const companyName = 'Version 1';
const phone = new PartyPhone('123456789', true);
const phoneCCD = '123456789';
const title = 'Mr';
const firstName = 'Jon';
const lastName = 'Doe';
const soleTraderTradingAs = 'test';
const dateOfBirth = new CitizenDate('10', '10', '1990');
const email = new Email('test@test.com');
const emailCCD = 'test@test.com';

const address: Address = new Address('Street test', '1', '1A', 'test', 'sl11gf');
const correspondenceAddressCUI: Address = new Address('Street test - correspondence', '1 - correspondence', '1A - correspondence', 'test - correspondence', 'sl11gf - correspondence');

const addressCCD: CCDAddress = {
  AddressLine1: 'Street test',
  AddressLine2: '1',
  AddressLine3: '1A',
  PostTown: 'test',
  PostCode: 'sl11gf',
  Country: 'test',
  County: 'test',
};

const correspondenceAddressCCD: CCDAddress = {
  AddressLine1: 'Street test - correspondence',
  AddressLine2: '1 - correspondence',
  AddressLine3: '1A - correspondence',
  PostTown: 'test - correspondence',
  PostCode: 'sl11gf - correspondence',
  Country: 'test - correspondence',
  County: 'test - correspondence',
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
    contactPerson: undefined,
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
  dateOfBirth: {date: dateOfBirth.date, year: 1990, month: 10, day: 10},
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
};

const getPartyCompanyCCD = () : CCDParty => {
  return {
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
    partyName: companyName,
    type: PartyType.COMPANY,
  };
};

const getPartyIndividualCCD = (): CCDParty => {
  return {
    companyName: undefined,
    individualDateOfBirth: new Date('Wed Oct 10 1990 01:00:00 GMT+0100'),
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
};

const getPartySoleTraderCCD = () : CCDParty => {
  return {
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
};

const respondent1LiPResponse : CCDRespondentLiPResponse = {
  respondent1LiPCorrespondenceAddress: correspondenceAddressCCD,
  respondent1LiPContactPerson: 'example contact',
};

describe('Party translations', () => {
  describe('translate party to cui model', () => {
    it('should translate COMPANY party to ccd', () => {
      //Given
      const partyCompanyCCD = getPartyCompanyCCD();
      //When
      const partyResponseCCD = toCUIParty(partyCompanyCCD);
      //Then
      expect(partyResponseCCD).toMatchObject(partyCompany);
    });

    it('should translate INDIVIDUAL party to cui', () => {
      //Given
      const partyIndividualCCD = getPartyIndividualCCD();
      //When
      const partyResponse = toCUIParty(partyIndividualCCD);
      //Then
      expect(partyResponse).toMatchObject(partyIndividual);
    });

    it('should translate SOLE TRADER party to cui', () => {
      const partySoleTraderCCD = getPartySoleTraderCCD();
      const partyResponse = toCUIParty(partySoleTraderCCD);
      expect(partyResponse).toMatchObject(partySoleTrader);
    });
  });

  describe('translate respondent party to cui model', () => {
    it('should translate COMPANY RESPONDENT party to ccd', () => {
      partyCompany.partyDetails.contactPerson = 'example contact';
      partyCompany.partyDetails.correspondenceAddress = correspondenceAddressCUI;
      partyCompany.partyDetails.postToThisAddress = YesNo.YES;
      //Given
      const partyCompanyCCD = getPartyCompanyCCD();
      //When
      const partyResponseCCD = toCUIPartyRespondent(partyCompanyCCD, respondent1LiPResponse);
      //Then
      expect(partyResponseCCD).toMatchObject(partyCompany);
    });

    it('should translate INDIVIDUAL RESPONDENT party to cui', () => {
      partyIndividual.partyDetails.correspondenceAddress = correspondenceAddressCUI;
      partyCompany.partyDetails.postToThisAddress = YesNo.YES;
      //Given
      const partyIndividualCCD = getPartyIndividualCCD();
      //When
      const partyResponse = toCUIPartyRespondent(partyIndividualCCD, respondent1LiPResponse);
      //Then
      expect(partyResponse).toMatchObject(partyIndividual);
    });

    it('should translate SOLE TRADER RESPONDENT party to cui', () => {
      partySoleTrader.partyDetails.correspondenceAddress = correspondenceAddressCUI;
      partyCompany.partyDetails.postToThisAddress = YesNo.YES;
      //Given
      const partySoleTraderCCD = getPartySoleTraderCCD();
      //When
      const partyResponse = toCUIPartyRespondent(partySoleTraderCCD, respondent1LiPResponse);
      //Then
      expect(partyResponse).toMatchObject(partySoleTrader);
    });

    it('should translate COMPANY RESPONDENT party to ccd with postToThisAddress: NO and contactPerson undefined ', () => {
      partyCompany.partyDetails.correspondenceAddress = undefined;
      partyCompany.partyDetails.contactPerson = undefined;
      partyCompany.partyDetails.postToThisAddress = YesNo.NO;
      //Given
      respondent1LiPResponse.respondent1LiPCorrespondenceAddress = undefined;
      respondent1LiPResponse.respondent1LiPContactPerson = undefined;
      const partyCompanyCCD = getPartyCompanyCCD();
      //When
      const partyResponseCCD = toCUIPartyRespondent(partyCompanyCCD, respondent1LiPResponse);
      //Then
      expect(partyResponseCCD).toMatchObject(partyCompany);
    });
  });
});
