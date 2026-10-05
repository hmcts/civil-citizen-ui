import {ValidationArguments} from 'class-validator';
import {DateNotAfterReferenceDate} from 'form/validators/dateNotAfterReferenceDate';

describe('DateNotAfterReferenceDate', () => {
  const validator = new DateNotAfterReferenceDate();

  const buildArgs = (object: Record<string, unknown>, constraints: unknown[] = ['toDate']): ValidationArguments => ({
    constraints,
    object,
    property: 'fromDate',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true for null input date', () => {
      //Given
      const toDate = new Date('2024-06-15');
      const validationArguments = buildArgs({toDate});
      //When
      const result = validator.validate(null, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when input date is before reference date', () => {
      //Given
      const toDate = new Date('2024-06-15');
      const fromDate = new Date('2024-06-10');
      const validationArguments = buildArgs({toDate});
      //When
      const result = validator.validate(fromDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when input date equals reference date', () => {
      //Given
      const toDate = new Date('2024-06-15');
      const fromDate = new Date('2024-06-15');
      const validationArguments = buildArgs({toDate});
      //When
      const result = validator.validate(fromDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when input date is after reference date', () => {
      //Given
      const toDate = new Date('2024-06-15');
      const fromDate = new Date('2024-06-20');
      const validationArguments = buildArgs({toDate});
      //When
      const result = validator.validate(fromDate, validationArguments);
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
      expect(message).toEqual('ERRORS.ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE');
    });
  });
});
