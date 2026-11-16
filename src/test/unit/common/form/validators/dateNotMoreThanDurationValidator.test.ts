import {ValidationArguments} from 'class-validator';
import {DateNotMoreThanDurationValidator} from 'form/validators/dateNotMoreThanDurationValidator';

describe('DateNotMoreThanDurationValidator', () => {
  const validator = new DateNotMoreThanDurationValidator();

  const buildArgs = (object: Record<string, unknown>, duration = 28): ValidationArguments => ({
    constraints: ['referenceDate', duration],
    object,
    property: 'inputDate',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true for null input date', () => {
      //Given
      const referenceDate = new Date('2024-06-01');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(null, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when input date is within duration', () => {
      //Given
      const referenceDate = new Date('2024-06-01');
      const inputDate = new Date('2024-06-15');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when input date equals duration boundary', () => {
      //Given
      const referenceDate = new Date('2024-06-01');
      const inputDate = new Date('2024-06-29');
      const validationArguments = buildArgs({referenceDate}, 28);
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when input date is more than duration days after reference', () => {
      //Given
      const referenceDate = new Date('2024-06-01');
      const inputDate = new Date('2024-06-30');
      const validationArguments = buildArgs({referenceDate}, 28);
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when input date is before reference date', () => {
      //Given
      const referenceDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-01');
      const validationArguments = buildArgs({referenceDate}, 28);
      //When
      const result = validator.validate(inputDate, validationArguments);
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
      expect(message).toEqual('ERRORS.DATE_NOT_MORE_THAN_28_DAYS');
    });
  });
});
