import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid month
 */
@ValidatorConstraint({name: 'OptionalDateMonthValidator', async: false})
export class OptionalDateMonthValidator implements ValidatorConstraintInterface {

  validate(month: string) {
    return !(month.length > 2 || !(isInt(month)) || toNumber(month) > 12 || toNumber(month) < 1);
  }

  defaultMessage() {
    return 'ERRORS.VALID_REAL_DATE';
  }
}
