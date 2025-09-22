import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid month
 */
@ValidatorConstraint({name: 'DateMonthValidator', async: false})
export class DateMonthValidator implements ValidatorConstraintInterface {
  monthExists:boolean;
  validate(month: string) {
    if (month === undefined || month === null || month === '') {
      this.monthExists = false;
      return false;
    }
    this.monthExists = true;
    return !(month.length > 2 || !(isInt(month)) || toNumber(month) > 12 || toNumber(month) < 1);
  }

  defaultMessage() {
    return this.monthExists?'ERRORS.VALID_REAL_MONTH':'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH';
  }
}
