import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
// import {VALID_DATE_NOT_IN_PAST} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is not a date more than 28 days after the original response date
 */
@ValidatorConstraint({name: 'agreedResponseDateNotMoreThan28DaysValidator', async: false})
export class AgreedResponseDateNotMoreThan28DaysValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    debugger;
    const property = validationArguments.constraints[0];
    const propertyValue = (validationArguments.object as any)[property];
    // const original = validationArguments.constraints[0];
    // Need to compare dates discarding hours, minutes etc.
    propertyValue.setHours(0, 0, 0, 0);
    if (inputDate !== null && (inputDate < propertyValue)) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS';
  }
}
