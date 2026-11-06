import {AtLeastOneFieldIsPopulatedConstraint} from 'form/validators/atLeastOneFieldIsPopulated';

describe('AtLeastOneFieldIsPopulatedConstraint', () => {
  const validator = new AtLeastOneFieldIsPopulatedConstraint();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when all fields are empty', () => {
      //Given
      const value: Record<string, unknown> = {a: '', b: null, c: undefined, d: 0, e: false};
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when at least one field is populated', () => {
      //Given
      const value = {a: '', b: 'populated'};
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when a numeric field is truthy', () => {
      //Given
      const value = {a: 1};
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for an empty object', () => {
      //Given
      const value = {};
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });
  });
});
