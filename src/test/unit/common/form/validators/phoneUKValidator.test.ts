import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

describe('PhoneUKValidator', () => {
  const validator = new PhoneUKValidator();

  describe('validate', () => {
    it('should return true for undefined', () => {

      const result = validator.validate(undefined);

      expect(result).toEqual(true);
    });

    it('should return true for null', () => {

      const result = validator.validate(null);

      expect(result).toEqual(true);
    });

    it('should return true for empty string', () => {

      const result = validator.validate('');

      expect(result).toEqual(true);
    });

    it('should return true for valid UK landline', () => {

      const result = validator.validate('02079460000');

      expect(result).toEqual(true);
    });

    it('should return true for valid UK mobile', () => {

      const result = validator.validate('07911123456');

      expect(result).toEqual(true);
    });

    it('should return true for valid +44 format', () => {

      const result = validator.validate('+442079460000');

      expect(result).toEqual(true);
    });

    it('should return false for invalid phone number', () => {

      const result = validator.validate('123');

      expect(result).toEqual(false);
    });

    it('should return false for letters', () => {

      const result = validator.validate('abcdefghij');

      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {

      const message = validator.defaultMessage();

      expect(message).toEqual('ERRORS.VALID_PHONE_NUMBER');
    });
  });
});
