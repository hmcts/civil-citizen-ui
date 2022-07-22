import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from '../../utils/dateUtils';

/**
 * Validates that the input value is not a date before the reference date
 */
@ValidatorConstraint({name: 'dateNotMoreThanDurationValidator', async: false})
export class DateNotBeforeReferenceDate implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const referenceDate = (validationArguments.object as any)[property];
    const daysBetweenTwoDates = getNumberOfDaysBetweenTwoDays(inputDate, referenceDate);

    if (inputDate !== null && daysBetweenTwoDates >= 0) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'ERRORS.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST';
  }
}
