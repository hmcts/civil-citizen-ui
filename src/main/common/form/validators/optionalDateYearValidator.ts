import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid year
 */
@ValidatorConstraint({name: 'OptionalDateYearValidator', async: false})
export class OptionalDateYearValidator implements ValidatorConstraintInterface {

  validate(year: string) {
    return !(year.length > 4 || !(isInt(year)) || toNumber(year) < 1000);
  }

  defaultMessage() {
    return 'ERRORS.VALID_REAL_DATE';
  }
}
