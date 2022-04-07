import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_DATE_NOT_IN_PAST} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the past
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInPastValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    // Only checking whether the date is the same day of the month as today, time is too strict
    if (inputDate !== null && (inputDate.getDate() < (new Date(Date.now()).getDate()))) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return VALID_DATE_NOT_IN_PAST;
  }
}
