import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_DATE_NOT_IN_PAST} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the past
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInPastValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    const today = new Date(Date.now());
    // Need to compare dates discarding hours, minutes etc.
    today.setHours(0,0,0,0);
    if (inputDate !== null && (inputDate < today)) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return VALID_DATE_NOT_IN_PAST;
  }
}
