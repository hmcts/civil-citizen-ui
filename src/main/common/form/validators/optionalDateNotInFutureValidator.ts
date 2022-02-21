import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {NON_FUTURE_VALUES_NOT_ALLOWED} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is either empty or an integer with no special characters
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
    return NON_FUTURE_VALUES_NOT_ALLOWED;
  }
}
