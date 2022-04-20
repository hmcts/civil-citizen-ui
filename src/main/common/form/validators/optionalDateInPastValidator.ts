import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_DATE_IN_PAST} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is a date in the past, that is, before today
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateInPastValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    const today = new Date(Date.now());
    // Need to compare dates discarding hours, minutes etc.
    today.setHours(0,0,0,0);
    if (inputDate !== null && (inputDate < today)) {
      return true;
    }
    return false;
  }

  defaultMessage() {
    return VALID_DATE_IN_PAST;
  }
}
