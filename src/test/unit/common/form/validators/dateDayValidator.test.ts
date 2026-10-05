import {DateDayValidator} from 'form/validators/dateDayValidator';

describe('DateDayValidator', () => {
  const validator = new DateDayValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
      expect(validator.dayExists).toEqual(false);
    });

    it('should return false for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(false);
      expect(validator.dayExists).toEqual(false);
    });

    it('should return false for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(false);
      expect(validator.dayExists).toEqual(false);
    });

    it('should return true for valid day 1', () => {
      //Given
      //When
      const result = validator.validate('1');
      //Then
      expect(result).toEqual(true);
      expect(validator.dayExists).toEqual(true);
    });

    it('should return true for valid day 31', () => {
      //Given
      //When
      const result = validator.validate('31');
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for valid day 01', () => {
      //Given
      //When
      const result = validator.validate('01');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for day 0', () => {
      //Given
      //When
      const result = validator.validate('0');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for day 32', () => {
      //Given
      //When
      const result = validator.validate('32');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for day longer than 2 characters', () => {
      //Given
      //When
      const result = validator.validate('123');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for non-integer day', () => {
      //Given
      //When
      const result = validator.validate('ab');
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return include day message when day does not exist', () => {
      //Given
      validator.validate('');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY');
    });

    it('should return valid real day message when day exists but invalid', () => {
      //Given
      validator.validate('32');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_REAL_DAY');
    });
  });
});
