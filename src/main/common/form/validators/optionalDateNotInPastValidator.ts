import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_DATE_NOT_IN_PAST} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the past
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInPastValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    if (inputDate !== null && (inputDate < (new Date(Date.now())))) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return VALID_DATE_NOT_IN_PAST;
  }
}
