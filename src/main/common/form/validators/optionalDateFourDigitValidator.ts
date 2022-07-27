import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_FOUR_DIGIT_YEAR} from '../validationErrors/errorMessageConstants';

const MINIMUM_FOUR_DIGIT_YEAR = 1000;

/**
 * Validates that the input value is a 4 digit number
 */
@ValidatorConstraint({name: 'OptionalDateFourDigitValidator', async: false})
export class OptionalDateFourDigitValidator implements ValidatorConstraintInterface {

  validate(year: number) {
    return !(year && year < MINIMUM_FOUR_DIGIT_YEAR);
  }

  defaultMessage() {
    return VALID_FOUR_DIGIT_YEAR;
  }
}
