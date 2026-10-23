import {NumberOfPeopleValidator} from 'form/validators/numberOfPeopleValidator';

describe('NumberOfPeopleValidator', () => {
  const validator = new NumberOfPeopleValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for null', () => {
      //Given
      //When
      const result = validator.validate(null);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for zero', () => {
      //Given
      //When
      const result = validator.validate(0);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for negative number', () => {
      //Given
      //When
      const result = validator.validate(-1);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true for one person', () => {
      //Given
      //When
      const result = validator.validate(1);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true for multiple people', () => {
      //Given
      //When
      const result = validator.validate(5);
      //Then
      expect(result).toEqual(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return NUMBER_OF_PEOPLE_REQUIRED when value is falsy', () => {
      //Given
      validator.validate(0);
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.NUMBER_OF_PEOPLE_REQUIRED');
    });

    it('should return VALID_STRICTLY_POSITIVE_NUMBER when value is truthy but invalid', () => {
      //Given
      validator.validate(-1);
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });
  });
});
