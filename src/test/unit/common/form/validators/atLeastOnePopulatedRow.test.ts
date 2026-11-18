import {AtLeastOnePopulatedRowConstraint} from 'form/validators/atLeastOnePopulatedRow';

const createRow = (empty: boolean) => ({
  isEmpty: () => empty,
});

describe('AtLeastOnePopulatedRowConstraint', () => {
  const validator = new AtLeastOnePopulatedRowConstraint();

  describe('validate', () => {
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

    it('should return false for an empty array', () => {
      //Given
      const value: Array<{isEmpty: () => boolean}> = [];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });
  });
});
