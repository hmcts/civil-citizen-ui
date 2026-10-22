import {OptionalDateFourDigitValidator} from 'form/validators/optionalDateFourDigitValidator';

describe('OptionalDateFourDigitValidator', () => {
  const validator = new OptionalDateFourDigitValidator();

  describe('validate', () => {
    it('should return true for NaN', () => {

      const result = validator.validate(NaN);

      expect(result).toEqual(true);
    });

    it('should return true for year 1000', () => {

      const result = validator.validate(1000);

      expect(result).toEqual(true);
    });

    it('should return true for year greater than 1000', () => {

      const result = validator.validate(2024);

      expect(result).toEqual(true);
    });

    it('should return false for year less than 1000', () => {

      const result = validator.validate(999);

      expect(result).toEqual(false);
    });

    it('should return false for year 0', () => {

      const result = validator.validate(0);

      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {

      const message = validator.defaultMessage();

      expect(message).toEqual('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });
  });
});
