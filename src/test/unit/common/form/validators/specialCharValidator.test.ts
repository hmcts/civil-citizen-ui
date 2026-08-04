import {SpecialCharValidator} from 'form/validators/specialCharValidator';

describe('SpecialCharValidator', () => {
  const validator = new SpecialCharValidator();
  describe('judgment online validation', () => {
    it('should return true for a string with valid characters', async () => {
      //Given
      const text = 'Valid string';
      //When
      const result = await validator.validate(text);
      //Then
      expect(result).toEqual(true);
    });
    it('should return false for a string with invalid characters', async () => {
      //Given
      const text = 'Invalid ˆ ` ´ ¨ chars';
      //When
      const result = await validator.validate(text);
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
  });
});
