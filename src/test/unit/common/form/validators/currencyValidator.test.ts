import {CurrencyValidator} from 'form/validators/currencyValidator';
import {MAX_AMOUNT_VALUE} from 'form/validators/validationConstraints';

describe('CurrencyValidator', () => {
  const validator = new CurrencyValidator();

  describe('validate', () => {
    it('should return true for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for zero', () => {
      //Given
      //When
      const result = validator.validate('0');
      //Then
      expect(result).toEqual(false);
      expect(validator.validNumber).toEqual(false);
    });

    it('should return true for valid currency with two decimals', () => {
      //Given
      //When
      const result = validator.validate('12.34');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid integer currency', () => {
      //Given
      //When
      const result = validator.validate('100');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for more than two decimal places', () => {
      //Given
      //When
      const result = validator.validate('10.123');
      //Then
      expect(result).toEqual(false);
      expect(validator.correctPlaces).toEqual(false);
    });

    it('should return false for leading zeros', () => {
      //Given
      //When
      const result = validator.validate('01');
      //Then
      expect(result).toEqual(false);
      expect(validator.validNumber).toEqual(false);
    });

    it('should return false for negative values', () => {
      //Given
      //When
      const result = validator.validate('-10.50');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when value is equal to or greater than MAX_AMOUNT_VALUE', () => {
      //Given
      //When
      const result = validator.validate(String(MAX_AMOUNT_VALUE));
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return VALID_STRICTLY_POSITIVE_NUMBER when number is invalid', () => {
      //Given
      validator.validate('0');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });

    it('should return VALID_TWO_DECIMAL_NUMBER when decimal places are incorrect', () => {
      //Given
      validator.validate('10.123');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });
  });
});
