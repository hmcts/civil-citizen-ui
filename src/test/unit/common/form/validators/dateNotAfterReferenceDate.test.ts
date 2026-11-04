import {ValidationArguments} from 'class-validator';
import {DateNotAfterReferenceDate} from 'form/validators/dateNotAfterReferenceDate';

const buildArgs = (until?: Date): ValidationArguments => ({
  value: undefined,
  constraints: ['until'],
  targetName: 'UnavailableDatePeriodGaHearing',
  object: {until},
  property: 'from',
});

describe('DateNotAfterReferenceDate', () => {
  const validator = new DateNotAfterReferenceDate();

  it('should return true when validationArguments are not provided', () => {
    //When
    const result = validator.validate(new Date(2025, 0, 15));
    //Then
    expect(result).toBe(true);
  });

  it('should return true when input date is before the reference date', () => {
    //When
    const result = validator.validate(new Date(2025, 0, 10), buildArgs(new Date(2025, 0, 15)));
    //Then
    expect(result).toBe(true);
  });

  it('should return true when input date is the same as the reference date', () => {
    //When
    const result = validator.validate(new Date(2025, 0, 15), buildArgs(new Date(2025, 0, 15)));
    //Then
    expect(result).toBe(true);
  });

  it('should return false when input date is after the reference date', () => {
    //When
    const result = validator.validate(new Date(2025, 0, 20), buildArgs(new Date(2025, 0, 15)));
    //Then
    expect(result).toBe(false);
  });

  it('should return true when input date is null', () => {
    //When
    const result = validator.validate(null as unknown as Date, buildArgs(new Date(2025, 0, 15)));
    //Then
    expect(result).toBe(true);
  });

  it('should return the default error message', () => {
    //Then
    expect(validator.defaultMessage()).toBe('ERRORS.ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE');
  });
});
