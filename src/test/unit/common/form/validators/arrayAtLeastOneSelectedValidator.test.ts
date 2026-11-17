import {ArrayAtLeastOneSelectedValidator} from 'form/validators/arrayAtLeastOneSelectedValidator';

describe('ArrayAtLeastOneSelectedValidator', () => {
  const validator = new ArrayAtLeastOneSelectedValidator();

  describe('validate', () => {
    it('should return false for undefined', () => {
      //Given
      //When
      const result = validator.validate(undefined);
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

    it('should return false when all elements are empty', () => {
      //Given
      const array: Array<Record<string, string | undefined>> = [{a: undefined, b: ''}, {a: '', b: undefined}];
      //When
      const result = validator.validate(array);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when at least one element is populated', () => {
      //Given
      const array = [{a: undefined, b: ''}, {a: 'selected', b: ''}];
      //When
      const result = validator.validate(array);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when all elements are populated', () => {
      //Given
      const array = [{a: 'one'}, {a: 'two'}];
      //When
      const result = validator.validate(array);
      //Then
      expect(result).toEqual(true);
    });
  });

  describe('isElementEmpty', () => {
    it('should return true when all values are undefined or empty', () => {
      //Given
      //When
      const result = validator.isElementEmpty({a: undefined, b: ''});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when any value is populated', () => {
      //Given
      //When
      const result = validator.isElementEmpty({a: 'value', b: ''});
      //Then
      expect(result).toEqual(false);
    });
  });
});
