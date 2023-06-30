import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid day
 */
@ValidatorConstraint({name: 'OptionalDateDayValidator', async: false})
export class OptionalDateDayValidator implements ValidatorConstraintInterface {

  validate(day: string) {
    return !(day.length > 2 || !(isInt(day)) || toNumber(day) > 31 || toNumber(day) < 1);
  }

  defaultMessage() {
    return 'ERRORS.VALID_REAL_DATE';
  }
}
