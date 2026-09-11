import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from '../../utils/dateUtils';

const STANDARD_BREATHING_SPACE = 'STANDARD';
const STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS = 60;

@ValidatorConstraint({name: 'liftBreathingSpaceEndDateValidator', async: false})
export class LiftBreathingSpaceEndDateValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    if (!inputDate || Number.isNaN(inputDate.getTime())) {
      return true;
    }
    const form = validationArguments.object as {
      startDate?: Date;
      breathingSpaceType?: string;
    };
    if (!form.startDate) {
      return true;
    }
    const daysDiff = getNumberOfDaysBetweenTwoDays(form.startDate, inputDate);
    if (daysDiff <= 0) {
      return false;
    }
    if (form.breathingSpaceType === STANDARD_BREATHING_SPACE && daysDiff > STANDARD_BREATHING_SPACE_MAX_DURATION_DAYS) {
      return false;
    }
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments) {
    const form = validationArguments.object as {
      startDate?: Date;
      breathingSpaceType?: string;
    };
    const inputDate = validationArguments.value as Date;
    if (!inputDate || !form.startDate) {
      return 'ERRORS.VALID_LIFT_END_DATE_AFTER_START';
    }
    const daysDiff = getNumberOfDaysBetweenTwoDays(form.startDate, inputDate);
    if (daysDiff <= 0) {
      return 'ERRORS.VALID_LIFT_END_DATE_AFTER_START';
    }
    return 'ERRORS.VALID_LIFT_END_DATE_MAX_60_DAYS';
  }
}
