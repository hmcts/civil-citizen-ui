import {SpecialCharValidator} from 'form/validators/specialCharValidator';

describe('SpecialCharValidator', () => {
  const validator = new SpecialCharValidator();

  describe('is Judgment online live', () => {
    it('should return true for a string with valid characters and flag ON', async () => {
      //When
      const result = await validator.validate('Valid string');
      //Then
      expect(result).toEqual(true);
    });
    it('should return false for a string with invalid characters and flag ON', async () => {
      //When
      const result = await validator.validate('Invalid ˆ ` ´ ¨ chars');
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
  });
});
