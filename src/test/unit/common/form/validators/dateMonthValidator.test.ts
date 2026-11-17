import {DateMonthValidator} from 'form/validators/dateMonthValidator';

describe('DateMonthValidator', () => {
  const validator = new DateMonthValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
      expect(validator.monthExists).toEqual(false);
    });

    it('should return false for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(false);
      expect(validator.monthExists).toEqual(false);
    });

    it('should return false for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(false);
      expect(validator.monthExists).toEqual(false);
    });

    it('should return true for valid month 1', () => {
      //Given
      //When
      const result = validator.validate('1');
      //Then
      expect(result).toEqual(true);
      expect(validator.monthExists).toEqual(true);
    });

    it('should return true for valid month 12', () => {
      //Given
      //When
      const result = validator.validate('12');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid month 01', () => {
      //Given
      //When
      const result = validator.validate('01');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for month 0', () => {
      //Given
      //When
      const result = validator.validate('0');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for month 13', () => {
      //Given
      //When
      const result = validator.validate('13');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for month longer than 2 characters', () => {
      //Given
      //When
      const result = validator.validate('123');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for non-integer month', () => {
      //Given
      //When
      const result = validator.validate('ab');
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return include month message when month does not exist', () => {
      //Given
      validator.validate('');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH');
    });

    it('should return valid real month message when month exists but invalid', () => {
      //Given
      validator.validate('13');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_REAL_MONTH');
    });
  });
});
