import { Address } from 'common/form/models/address';
import { GenericForm } from 'common/form/models/genericForm';

const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';
const postCode = ' EC1A 1BB ';
const stringWithSpecialChar1 = ' SpecialChar ˆ 1';
const stringWithSpecialChar2 = ' SpecialChar ` 2';
const stringWithSpecialChar3 = ' SpecialChar ´ 3';
const stringWithSpecialChar4 = ' SpecialChar ¨ 4';

describe(('For Address Form'), () => {

  describe('is Judgment online ON', () => {
    it('should not throw error if address length OK and flag ON', async () => {
      //Given
      const address = new Address(string35charLong, string35charLong, string35charLong, string35charLong, postCode);
      const form = new GenericForm(address);
      //When
      await form.validate();
      //Then
      expect(form.hasErrors()).toBeFalsy();
    });

    it('should throw error in case of exceeded max length and flag ON', async () => {
      //Given
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

