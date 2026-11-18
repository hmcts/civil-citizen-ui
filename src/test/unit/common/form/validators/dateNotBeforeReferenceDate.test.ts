import {ValidationArguments} from 'class-validator';
import {DateNotBeforeReferenceDate} from 'form/validators/dateNotBeforeReferenceDate';

describe('DateNotBeforeReferenceDate', () => {
  const validator = new DateNotBeforeReferenceDate();

  const buildArgs = (object: Record<string, unknown>, property = 'referenceDate'): ValidationArguments => ({
    constraints: [property],
    object,
    property: 'inputDate',
    targetName: '',
    value: undefined,
  });

  describe('validate', () => {
    it('should return true for null input date', () => {
      //Given
      const referenceDate = new Date('2024-06-15');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(null, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it.each([
      [true, 'after reference date', new Date('2024-06-20')],
      [false, 'equal to reference date for non-joIssuedDate', new Date('2024-06-15')],
      [false, 'before reference date for non-joIssuedDate', new Date('2024-06-10')],
    ])('should return %s when input date is %s', (expected, _label, inputDate) => {
      const referenceDate = new Date('2024-06-15');
      const validationArguments = buildArgs({referenceDate});
      const result = validator.validate(inputDate, validationArguments);
      expect(result).toEqual(expected);
    });

    it.each([
      [true, 'equal to joIssuedDate', new Date('2024-06-15')],
      [false, 'before joIssuedDate', new Date('2024-06-10')],
      [true, 'after joIssuedDate', new Date('2024-06-20')],
    ])('should return %s when input date is %s', (expected, _label, inputDate) => {
      const joIssuedDate = new Date('2024-06-15');
      const validationArguments = buildArgs({joIssuedDate}, 'joIssuedDate');
      const result = validator.validate(inputDate, validationArguments);
      expect(result).toEqual(expected);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {
      //Given
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST');
    });
  });
});
