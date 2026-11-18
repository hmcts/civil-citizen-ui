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

    it.each([
      [true, 'before reference date', new Date('2024-06-10')],
      [true, 'equal to reference date', new Date('2024-06-15')],
      [false, 'after reference date', new Date('2024-06-20')],
    ])('should return %s when input date is %s', (expected, _label, fromDate) => {
      const toDate = new Date('2024-06-15');
      const validationArguments = buildArgs({toDate});
      const result = validator.validate(fromDate, validationArguments);
      expect(result).toEqual(expected);
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
