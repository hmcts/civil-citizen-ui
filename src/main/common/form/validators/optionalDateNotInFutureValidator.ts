import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value is not a date in the future
 */
@ValidatorConstraint({name: 'customDate', async: false})
export class OptionalDateNotInFutureValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date) {
    return !(inputDate !== null && (inputDate > (new Date(Date.now()))));
  }

  defaultMessage() {
    return 'ERRORS.VALID_DATE';
  }
}
