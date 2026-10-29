import {EmailValidator} from 'form/validators/emailValidator';

describe('EmailValidator', () => {
  const validator = new EmailValidator();

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

    it('should return true for a valid email', () => {

      const result = validator.validate('test@example.com');

      expect(result).toEqual(true);
    });

    it('should return true for email with subdomain', () => {

      const result = validator.validate('user.name@mail.example.co.uk');

      expect(result).toEqual(true);
    });

    it('should return false for email without at sign', () => {

      const result = validator.validate('testexample.com');

      expect(result).toEqual(false);
    });

    it('should return false for email without domain', () => {

      const result = validator.validate('test@');

      expect(result).toEqual(false);
    });

    it('should return false for email exceeding max length', () => {

      const longLocal = 'a'.repeat(310);
      const value = `${longLocal}@ex.com`;

      const result = validator.validate(value);

      expect(result).toEqual(false);
    });

    it('should return false for invalid TLD length', () => {

      const result = validator.validate('test@example.toolongtld');

      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {

      const message = validator.defaultMessage();

      expect(message).toEqual('ERRORS.ENTER_VALID_EMAIL');
    });
  });
});
