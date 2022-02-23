import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {FUTURE_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the future
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInFutureValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    if (inputDate !== null && (inputDate > (new Date(Date.now())))) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return FUTURE_VALUES_NOT_ALLOWED;
  }
}
