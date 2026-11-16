import {ValidationArguments} from 'class-validator';
import {HowMuchOweAmountValidator} from 'form/validators/howMuchOweAmountValidator';

describe('HowMuchOweAmountValidator', () => {
  const validator = new HowMuchOweAmountValidator();

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

    it('should return true when value is falsy', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100});
      //When
      const result = validator.validate(0, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when value is NaN', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100});
      //When
      const result = validator.validate(NaN, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when value is less than or equal to property value minus one pence', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100});
      //When
      const result = validator.validate(99.99, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when value is greater than property value minus one pence', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 100});
      //When
      const result = validator.validate(100, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when value exceeds property value', () => {
      //Given
      const validationArguments = buildArgs({maxValue: 50});
      //When
      const result = validator.validate(50.01, validationArguments);
      //Then
      expect(result).toEqual(false);
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
