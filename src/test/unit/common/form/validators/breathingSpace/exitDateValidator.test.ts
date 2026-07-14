import {ExitDateValidator} from 'common/form/validators/breathingSpace/exitDateValidator';
import {BreathingSpaceType} from 'common/models/breathingSpace/breathingSpace';
import {ValidationArguments} from 'class-validator';

describe('ExitDateValidator', () => {
  const validator = new ExitDateValidator();

  describe('validate', () => {
    it('should return true if exitDate or startDate is missing', () => {
      const args = {
        object: {
          breathingSpaceStartDate: undefined,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.validate(new Date(), args)).toBeTruthy();
      expect(validator.validate(undefined, args)).toBeTruthy();
    });

    it('should return true if exitDate is after startDate for Standard BS and within 60 days', () => {
      const startDate = new Date(2023, 0, 1);
      const exitDate = new Date(2023, 0, 10);
      const args = {
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.validate(exitDate, args)).toBeTruthy();
    });

    it('should return false if exitDate is before or equal to startDate', () => {
      const startDate = new Date(2023, 0, 10);
      const exitDate = new Date(2023, 0, 5);
      const args = {
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.validate(exitDate, args)).toBeFalsy();
      expect(validator.validate(startDate, args)).toBeFalsy();
    });

    it('should return false if exitDate is more than 60 days after startDate for Standard BS', () => {
      const startDate = new Date(2023, 0, 1);
      const exitDate = new Date(2023, 2, 5); // Over 60 days
      const args = {
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.validate(exitDate, args)).toBeFalsy();
    });

    it('should return true if exitDate is more than 60 days after startDate for Mental Health BS', () => {
      const startDate = new Date(2023, 0, 1);
      const exitDate = new Date(2023, 5, 1); // Way over 60 days
      const args = {
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.MENTAL_HEALTH,
        },
      } as ValidationArguments;
      expect(validator.validate(exitDate, args)).toBeTruthy();
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message when date is before start date', () => {
      const startDate = new Date(2023, 0, 10);
      const exitDate = new Date(2023, 0, 5);
      const args = {
        value: exitDate,
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.defaultMessage(args)).toBe('ERRORS.BREATHING_SPACE_EXIT_DATE_AFTER_START');
    });

    it('should return correct error message when date is more than 60 days for Standard BS', () => {
      const startDate = new Date(2023, 0, 1);
      const exitDate = new Date(2023, 2, 5);
      const args = {
        value: exitDate,
        object: {
          breathingSpaceStartDate: startDate,
          breathingSpaceType: BreathingSpaceType.STANDARD,
        },
      } as ValidationArguments;
      expect(validator.defaultMessage(args)).toBe('ERRORS.BREATHING_SPACE_EXIT_DATE_NOT_MORE_THAN_60_DAYS');
    });

    it('should return generic error message if data is missing', () => {
      const args = {
        value: undefined,
        object: {
          breathingSpaceStartDate: undefined,
        },
      } as ValidationArguments;
      expect(validator.defaultMessage(args)).toBe('ERRORS.VALID_DATE');
    });
  });
});
