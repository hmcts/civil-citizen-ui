import { GenericForm } from 'common/form/models/genericForm';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {PartyDetails} from 'form/models/partyDetails';

const valid70charNamePart1of3 = ' Abcdefghi jklmno ';
const valid70charNamePart2of3 = ' qrstu vwxyzAbcdefg hijklm ';
const valid70charNamePart3of3 = ' opqrstu vwxyzAbcdefgh ijklm ';
const valid70charNamePart1of2 = ' Abcdefghi jklmnopqrstu vwxyz ';
const valid70charNamePart2of2 = ' Abcdefg hijklmnopqrstu vwxyzAbcdefgh ijkl ';
const valid70charPartyName = ' This is a 70 char Party Name 789 0123456789 0123456789 0123456789 0123 ';
const string71charLong = valid70charPartyName + 'A';
const string51charLong = 'This is a 51 char address aAbBcCdDeEfFgGhHiIjJkKlLm';
const string50charLong = 'This is a 50 char address aAbBcCdDeEfFgGhHiIjJkKlL';
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';
const string256charLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
  'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in';
const string255charLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
  'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor i';
const postCode = ' EC1A 1BB ';
const stringWithSpecialChar1 = ' SpecialChar ˆ 1';
const stringWithSpecialChar2 = ' SpecialChar ` 2';
const stringWithSpecialChar3 = ' SpecialChar ´ 3';
const stringWithSpecialChar4 = ' SpecialChar ¨ 4';

describe(('For PartyDetails Form'), () => {
  describe(('Constructor test'), () => {
    it('should trim values and calculate lengths', async () => {
      //Given
      const trimmedString = 'This is a 35 char address aAbBcCdDe';
      const trimmedPostCode = 'EC1A 1BB';
      const partyDetails = new PartyDetails({
        partyName: string35charLong, title: string35charLong, firstName: string35charLong
        , lastName: string35charLong, addressLine1: string35charLong, addressLine2: string35charLong
        , addressLine3: string35charLong, city: string35charLong, postCode: postCode
        , soleTraderTradingAs: string35charLong, contactPerson: string35charLong
        , postToThisAddress: string35charLong, provideCorrespondenceAddress: string35charLong}, false);
      //When
      const form = new GenericForm(partyDetails);
      //Then
      expect(form.model.partyName).toEqual(trimmedString);
      expect(form.model.title).toEqual(trimmedString);
      expect(form.model.firstName).toEqual(trimmedString);
      expect(form.model.lastName).toEqual(trimmedString);
      expect(form.model.primaryAddress.addressLine1).toEqual(trimmedString);
      expect(form.model.primaryAddress.addressLine2).toEqual(trimmedString);
      expect(form.model.primaryAddress.addressLine3).toEqual(trimmedString);
      expect(form.model.primaryAddress.city).toEqual(trimmedString);
      expect(form.model.primaryAddress.postCode).toEqual(trimmedPostCode);
      expect(form.model.soleTraderTradingAs).toEqual(string35charLong);
      expect(form.model.contactPerson).toEqual(string35charLong);
      expect(form.model.postToThisAddress).toEqual(string35charLong);
      expect(form.model.provideCorrespondenceAddress).toEqual(string35charLong);
      expect(form.model.nameLength).toEqual(107);
      expect(form.model.partyNameLength).toEqual(35);
    });
    it('should calculate length when no title present', async () => {
      //Given
      const partyDetails = new PartyDetails({
        title: '', firstName: string35charLong
        , lastName: string35charLong }, false);
      //When
      const form = new GenericForm(partyDetails);
      //Then
      expect(form.model.nameLength).toEqual(71);
    });
  });
  describe('isJudgmentOnlineLive flag OFF', () => {
    it('should not throw error if inputs lengths OK and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const partyDetails = new PartyDetails({
        title: string35charLong, firstName: string255charLong
        , lastName: string255charLong, addressLine1: string50charLong, addressLine2: string50charLong
        , addressLine3: string50charLong, city: string50charLong, postCode: postCode}, false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should not throw error for partyName if flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const partyDetails = new PartyDetails({partyName: string256charLong
        , addressLine1: string50charLong, addressLine2: string50charLong, addressLine3: string50charLong
        ,city: string50charLong, postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error if inputs lengths not OK and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const partyDetails = new PartyDetails({title: string36charLong, firstName: string256charLong
        , lastName: string256charLong, addressLine1: string51charLong, addressLine2: string51charLong
        , addressLine3: string51charLong,city: string51charLong, postCode: string35charLong},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errors[3].children.length).toEqual(4);
      expect(form.errorFor('title')).toEqual('ERRORS.ENTER_VALID_TITLE');
      expect(form.errorFor('firstName')).toEqual('ERRORS.TEXT_TOO_MANY');
      expect(form.errorFor('lastName')).toEqual('ERRORS.TEXT_TOO_MANY');
      expect(form.errorFor('primaryAddress[addressLine2]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
      expect(form.errorFor('primaryAddress[addressLine3]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
      expect(form.errorFor('primaryAddress[city]')).toEqual('ERRORS.TOWN_CITY_TOO_MANY');
      expect(form.errorFor('primaryAddress[postCode]')).toEqual('ERRORS.DEFENDANT_POSTCODE_NOT_VALID');
    });
  });

  describe('isJudgmentOnlineLive flag ON', () => {
    it('should not throw error if title+firstName+lastName length OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: valid70charNamePart1of3
        , firstName: valid70charNamePart2of3, lastName: valid70charNamePart3of3, addressLine1: string35charLong
        , addressLine2: string35charLong, addressLine3: string35charLong,city: string35charLong
        , postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should not throw error if no title and firstName+lastName length OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: '', firstName: valid70charNamePart1of2
        , lastName: valid70charNamePart2of2, addressLine1: string35charLong, addressLine2: string35charLong
        , addressLine3: string35charLong,city: string35charLong, postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should not throw error if partyName length OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({partyName: valid70charPartyName
        , addressLine1: string35charLong, addressLine2: string35charLong, addressLine3: string35charLong
        ,city: string35charLong, postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should not throw error if title length OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: string35charLong
        , firstName: 'test', lastName: 'test', addressLine1: string35charLong
        , addressLine2: string35charLong, addressLine3: string35charLong,city: string35charLong
        , postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error if input lengths not OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: string35charLong, firstName: string51charLong
        , lastName: string51charLong, addressLine1: string36charLong, addressLine2: string36charLong
        , addressLine3: string36charLong,city: string36charLong, postCode: string35charLong},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errors[3].children.length).toEqual(5);
      expect(form.errorFor('title')).toEqual('ERRORS.TEXT_TOO_MANY');
      expect(form.errorFor('firstName')).toEqual(' ');
      expect(form.errorFor('lastName')).toEqual(' ');
      expect(form.errorFor('primaryAddress[addressLine1]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[addressLine2]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[addressLine3]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[city]')).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[postCode]')).toEqual('ERRORS.TEXT_TOO_MANY');
    });
    it('should throw error if no title, lengths not OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: '', firstName: string51charLong
        , lastName: string51charLong, addressLine1: string36charLong, addressLine2: string36charLong
        , addressLine3: string36charLong,city: string36charLong, postCode: string35charLong},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(3);
      expect(form.errors[2].children.length).toEqual(5);
      expect(form.errorFor('firstName')).toEqual('ERRORS.TEXT_TOO_MANY');
      expect(form.errorFor('lastName')).toEqual(' ');
      expect(form.errorFor('primaryAddress[addressLine1]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[addressLine2]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[addressLine3]')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[city]')).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
      expect(form.errorFor('primaryAddress[postCode]')).toEqual('ERRORS.TEXT_TOO_MANY');
    });
    it('should throw error if special characters present and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({title: stringWithSpecialChar1
        , firstName: stringWithSpecialChar2, lastName: stringWithSpecialChar3, addressLine1: stringWithSpecialChar4
        , addressLine2: stringWithSpecialChar1, addressLine3: stringWithSpecialChar2,city: stringWithSpecialChar3
        , postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errors[3].children.length).toEqual(4);
      expect(form.errorFor('title')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('firstName')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('lastName')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('primaryAddress[addressLine1]')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('primaryAddress[addressLine2]')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('primaryAddress[addressLine3]')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('primaryAddress[city]')).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
    it('should throw error if partyName length not OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const partyDetails = new PartyDetails({partyName: string71charLong
        , addressLine1: string35charLong, addressLine2: string35charLong, addressLine3: string35charLong
        ,city: string35charLong, postCode: postCode},false);
      const form = new GenericForm(partyDetails);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(1);
      expect(form.errorFor('partyName')).toEqual('ERRORS.TEXT_TOO_MANY');
    });
  });
});

