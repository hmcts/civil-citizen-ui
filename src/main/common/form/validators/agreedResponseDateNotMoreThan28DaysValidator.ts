import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from '../../utils/dateUtils';

/**
 * Validates that the input value is not a date more than 28 days after the original response date
 */
@ValidatorConstraint({name: 'agreedResponseDateNotMoreThan28DaysValidator', async: false})
export class AgreedResponseDateNotMoreThan28DaysValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const originalResponseDate = (validationArguments.object as any)[property];
    const daysBetweenTwoDates = getNumberOfDaysBetweenTwoDays(originalResponseDate, inputDate);

    if (inputDate !== null && daysBetweenTwoDates > 28) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS';
  }
}
