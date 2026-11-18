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

    it.each([
      [true, 'input date equals duration boundary', new Date('2024-06-01'), new Date('2024-06-29')],
      [false, 'input date is more than duration days after reference', new Date('2024-06-01'), new Date('2024-06-30')],
      [true, 'input date is before reference date', new Date('2024-06-15'), new Date('2024-06-01')],
    ])('should return %s when %s', (expected, _label, referenceDate, inputDate) => {
      const validationArguments = buildArgs({referenceDate}, 28);
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
      expect(message).toEqual('ERRORS.DATE_NOT_MORE_THAN_28_DAYS');
    });
  });
});
