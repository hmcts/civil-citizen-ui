import {AccountBalanceValidator} from 'form/validators/accountBalanceValidator';
import {MAX_AMOUNT_VALUE} from 'form/validators/validationConstraints';

describe('AccountBalanceValidator', () => {
  const validator = new AccountBalanceValidator();

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

    it.each([
      ['empty string', ''],
      ['valid positive amount with two decimals', '12.34'],
      ['valid negative amount', '-10.50'],
      ['integer amount', '100'],
      ['zero', '0'],
    ])('should return true for %s', (_label, input) => {
      const result = validator.validate(input);
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

    it('should return false for negative zero', () => {
      //Given
      //When
      const result = validator.validate('-0');
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
    it('should return NUMBER_REQUIRED when number is invalid', () => {
      //Given
      validator.validate('01');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.NUMBER_REQUIRED');
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
