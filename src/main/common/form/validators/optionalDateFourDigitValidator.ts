import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_FOUR_DIGIT_YEAR} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date in the past
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateFourDigitValidator implements ValidatorConstraintInterface {

  validate(year: number) {
    if (year !== null && (year < 100)){
      return false;
    }
    return true;
  }

  defaultMessage() {
    return VALID_FOUR_DIGIT_YEAR;
  }
}
