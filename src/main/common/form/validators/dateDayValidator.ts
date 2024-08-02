import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid day
 */
@ValidatorConstraint({name: 'DateDayValidator', async: false})
export class DateDayValidator implements ValidatorConstraintInterface {
  dayExists:boolean;
  validate(day: string) {
    if (day === undefined || day === null || day === '') {
      this.dayExists = false;
      return false;
    }
    this.dayExists = true;
    return !(day.length > 2 || !(isInt(day)) || toNumber(day) > 31 || toNumber(day) < 1);
  }

  defaultMessage() {
    return this.dayExists?'ERRORS.VALID_REAL_DAY':'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY';
  }
}
