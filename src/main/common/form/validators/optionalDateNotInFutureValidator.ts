import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_DATE} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the future
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInFutureValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    return !(inputDate !== null && (inputDate > (new Date(Date.now()))));
  }

  defaultMessage() {
    return VALID_DATE;
  }
}
