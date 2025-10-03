import {MaxLengthValidator} from 'form/validators/maxLengthValidator';

const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';

describe('MaxLengthValidator', () => {
  const validator = new MaxLengthValidator();

  describe('is Judgment Online flag ON', () => {
    it('should return true for addressLine1 with 35 chars and flag ON', async () => {
      //When
      const result = await validator.validate(string35charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for addressLine1 with 36 chars and flag ON', async () => {
      //When
      const result = await validator.validate(string36charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
    });
    it('should return false for city with 36 chars and flag ON', async () => {
      //When
      const result = await validator.validate(string36charLong, {
        constraints: [''], object: undefined
        , property: 'city', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
    });
  });
});
