import {AtLeastOneRowIsPopulatedConstraint} from 'form/validators/atLeastOneRowIsPopulated';

const createRow = (empty: boolean) => ({
  isEmpty: () => empty,
});

describe('AtLeastOneRowIsPopulatedConstraint', () => {
  const validator = new AtLeastOneRowIsPopulatedConstraint();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for non-array value', () => {
      //Given
      //When
      const result = validator.validate({isEmpty: () => false});
      //Then
      expect(result).toEqual(false);
    });

    it('should return false for empty array', () => {
      //Given
      //When
      const result = validator.validate([]);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when all rows are empty', () => {
      //Given
      const value = [createRow(true), createRow(true)];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when at least one row is populated', () => {
      //Given
      const value = [createRow(true), createRow(false)];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when all rows are populated', () => {
      //Given
      const value = [createRow(false), createRow(false)];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });
  });
});
