import {ValidationArguments} from 'class-validator';
import {MaxLengthValidator} from 'form/validators/maxLengthValidator';

const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';

describe('MaxLengthValidator', () => {
  const validator = new MaxLengthValidator();
  describe('judgment online validation', () => {
    it('should return true for addressLine1 with 35 chars', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined};
      //When
      const result = await validator.validate(string35charLong, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for addressLine3 with 0 chars', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: [''], object: undefined
        , property: 'addressLine3', targetName: '', value: undefined};
      //When
      const result = await validator.validate('', validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for addressLine1 with 36 chars', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined};
      //When
      const result = await validator.validate(string36charLong, validationArguments);
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
    });
    it('should return false for city with 36 chars', async () => {
      //Given
      const validationArguments: ValidationArguments = {
        constraints: [''], object: undefined
        , property: 'city', targetName: '', value: undefined};
      //When
      const result = await validator.validate(string36charLong, validationArguments);
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
    });
  });
});
