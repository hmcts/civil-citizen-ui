import { Address } from 'common/form/models/address';
import { GenericForm } from 'common/form/models/genericForm';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

const string51charLong = 'This is a 51 char address aAbBcCdDeEfFgGhHiIjJkKlLm';
const string50charLong = 'This is a 50 char address aAbBcCdDeEfFgGhHiIjJkKlL';
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';
const postCode = ' EC1A 1BB ';
const stringWithSpecialChar1 = ' SpecialChar ˆ 1';
const stringWithSpecialChar2 = ' SpecialChar ` 2';
const stringWithSpecialChar3 = ' SpecialChar ´ 3';
const stringWithSpecialChar4 = ' SpecialChar ¨ 4';

describe(('For Address Form'), () => {
  describe('isJudgmentOnlineLive flag OFF', () => {
    it('should not throw error if address length OK and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const address = new Address(string50charLong, string50charLong, string50charLong, string50charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });
    it('should not throw error if address length OK, contains special chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const address = new Address(stringWithSpecialChar1, stringWithSpecialChar2
        , stringWithSpecialChar3, stringWithSpecialChar4, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error in case of exceeded max length and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const address = new Address(string51charLong, string51charLong, string51charLong, string51charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(3);
      expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
      expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
      expect(form.errorFor('city')).toEqual('ERRORS.TOWN_CITY_TOO_MANY');
    });
    it('should throw error in case addressLine1 is blank and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      const address = new Address('', string50charLong, string50charLong, string50charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(1);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.VALID_ADDRESS_LINE_1');
    });
  });

  describe('isJudgmentOnlineLive flag ON', () => {
    it('should not throw error if address length OK and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const address = new Address(string35charLong, string35charLong, string35charLong, string35charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error in case of exceeded max length and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const address = new Address(string36charLong, string36charLong, string36charLong, string36charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('addressLine2')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('addressLine3')).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
      expect(form.errorFor('city')).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
    });
    it('should throw error if address length OK, contains special chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      const address = new Address(stringWithSpecialChar1, stringWithSpecialChar2
        , stringWithSpecialChar3, stringWithSpecialChar4, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.errors.length).toEqual(4);
      expect(form.errorFor('addressLine1')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('addressLine2')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('addressLine3')).toEqual('ERRORS.SPECIAL_CHARACTERS');
      expect(form.errorFor('city')).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
  });
});

