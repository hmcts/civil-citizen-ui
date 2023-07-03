import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';
import isInt = validator.isInt;
import {toNumber} from 'lodash';

/**
 * Validates that the input value is a valid year
 */
@ValidatorConstraint({name: 'OptionalDateYearValidator', async: false})
export class OptionalDateYearValidator implements ValidatorConstraintInterface {
  yearExists:boolean;
  validate(year: string) {
    if (year === undefined || year === null || year === '') {
      this.yearExists = false;
      return false;
    }
    this.yearExists = true;
    return !(year.length > 4 || !(isInt(year)) || toNumber(year) < 1000);
  }

  defaultMessage() {
    return this.yearExists?'ERRORS.VALID_REAL_DATE':'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR';
  }
}
