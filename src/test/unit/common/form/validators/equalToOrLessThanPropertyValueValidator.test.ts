import {ValidationArguments} from 'class-validator';
import {EqualToOrLessThanPropertyValueValidator} from 'form/validators/equalToOrLessThanPropertyValueValidator';

describe('EqualToOrLessThanPropertyValueValidator', () => {
  const validator = new EqualToOrLessThanPropertyValueValidator();

  const buildArgs = (object: Record<string, unknown>, constraints: unknown[] = ['maxValue']): ValidationArguments => ({
    constraints,
    object,
    property: 'amount',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true when constraints are missing', () => {
      //Given
      const validationArguments = buildArgs({}, []);
      //When
      const result = validator.validate(10, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when property value is undefined', () => {
      //Given
      const validationArguments = buildArgs({});
      //When
      const result = validator.validate(10, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when property value is NaN', () => {
      //Given
      const validationArguments = buildArgs({maxValue: NaN});
      //When
      const result = validator.validate(10, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it.each([
      [true, 'value is falsy', 0],
      [true, 'value equals property value', 100],
      [true, 'value is less than property value', 50],
      [false, 'value is greater than property value', 101],
    ])('should return %s when %s', (expected, _label, value) => {
      const validationArguments = buildArgs({maxValue: 100});
      const result = validator.validate(value, validationArguments);
      expect(result).toEqual(expected);
    });

    it('should return false for equal value when strict comparison is enabled', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100}, ['maxValue', true]);
      //When
      const result = validator.validate(100, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true for less than value when strict comparison is enabled', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100}, ['maxValue', true]);
      //When
      const result = validator.validate(99, validationArguments);
      //Then
      expect(result).toEqual(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {
      //Given
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_NUMBER_FOR_PREVIOUS_PAGE');
    });
  });
});
