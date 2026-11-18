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

    it('should return true when input date is after reference date', () => {
      //Given
      const referenceDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-20');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when input date equals reference date for non-joIssuedDate', () => {
      //Given
      const referenceDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-15');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return false when input date is before reference date for non-joIssuedDate', () => {
      //Given
      const referenceDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-10');
      const validationArguments = buildArgs({referenceDate});
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when input date equals joIssuedDate', () => {
      //Given
      const joIssuedDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-15');
      const validationArguments = buildArgs({joIssuedDate}, 'joIssuedDate');
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false when input date is before joIssuedDate', () => {
      //Given
      const joIssuedDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-10');
      const validationArguments = buildArgs({joIssuedDate}, 'joIssuedDate');
      //When
      const result = validator.validate(inputDate, validationArguments);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when input date is after joIssuedDate', () => {
      //Given
      const joIssuedDate = new Date('2024-06-15');
      const inputDate = new Date('2024-06-20');
      const validationArguments = buildArgs({joIssuedDate}, 'joIssuedDate');
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
      expect(message).toEqual('ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST');
    });
  });
});
