import { PostcodeValidator } from 'common/form/validators/postcodeValidator';

describe('PostcodeValidator', () => {
  const validator = new PostcodeValidator();

  describe('validate', () => {
    it('should return true for a valid postcode in England', () => {
      const result = validator.validate('SW1H 9AJ');
      expect(result).toEqual(true);
    });
    it('should return true for a valid postcode in England, ', () => {
      const result = validator.validate('GL50 1JZ');
      expect(result).toEqual(true);
    });
    it('should return true for a valid postcode in Wales', () => {
      const result = validator.validate('CF10 3NQ');
      expect(result).toEqual(true);
    });
    it('should return false for a valid postcode in Northern Ireland', () => {
      const result = validator.validate('BT1 1AA');
      expect(result).toEqual(false);
    });
    it('should return false for a valid postcode in Scotland', () => {
      const result = validator.validate('KW1 5BA');
      expect(result).toEqual(false);
    });
    it('should return false for an invalid postcode', () => {
      const result = validator.validate('ABC123');
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the default error message', () => {
      const defaultMessage = validator.defaultMessage();
      expect(defaultMessage).toEqual('ERRORS.DEFENDANT_POSTCODE_NOT_VALID');
    });
  });
});