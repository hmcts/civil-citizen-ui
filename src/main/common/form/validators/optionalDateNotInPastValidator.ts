import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {FIRST_PAYMENT_DATE_IN_THE_FUTURE} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the future
 */
@ValidatorConstraint({name: 'customDateNotInPast', async: false})
export class OptionalDateNotInPastValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    if (inputDate && (inputDate < (new Date(Date.now())))) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return FIRST_PAYMENT_DATE_IN_THE_FUTURE;
  }
}
