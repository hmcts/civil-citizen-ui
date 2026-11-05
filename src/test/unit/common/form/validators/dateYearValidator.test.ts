import {DateYearValidator} from 'form/validators/dateYearValidator';

describe('DateYearValidator', () => {
  const validator = new DateYearValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
      expect(validator.yearExists).toEqual(false);
    });

    it('should return false for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(false);
      expect(validator.yearExists).toEqual(false);
    });

    it('should return false for empty string', () => {
      //Given
      //When
      const result = validator.validate('');
      //Then
      expect(result).toEqual(false);
      expect(validator.yearExists).toEqual(false);
    });

    it('should return true for valid four digit year', () => {
      //Given
      //When
      const result = validator.validate('2020');
      //Then
      expect(result).toEqual(true);
      expect(validator.yearExists).toEqual(true);
    });

    it('should return true for year 1000', () => {
      //Given
      //When
      const result = validator.validate('1000');
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for year less than 1000', () => {
      //Given
      //When
      const result = validator.validate('999');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for year longer than 4 characters', () => {
      //Given
      //When
      const result = validator.validate('20201');
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for non-integer year', () => {
      //Given
      //When
      const result = validator.validate('abcd');
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return include year message when year does not exist', () => {
      //Given
      validator.validate('');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR');
    });

    it('should return valid real year message when year exists but invalid', () => {
      //Given
      validator.validate('999');
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_REAL_YEAR');
    });
  });
});
