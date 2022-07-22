import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from '../../utils/dateUtils';

/**
 * Validates that the input value is not a date more than duration days after the reference date
 */
@ValidatorConstraint({name: 'dateNotMoreThanDurationValidator', async: false})
export class DateNotMoreThanDurationValidator implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const duration = validationArguments.constraints[1];
    const referenceDate = (validationArguments.object as any)[property];
    const daysBetweenTwoDates = getNumberOfDaysBetweenTwoDays(referenceDate, inputDate);

    return !(inputDate !== null && daysBetweenTwoDates > duration);
  }

  defaultMessage() {
    return 'ERRORS.DATE_NOT_MORE_THAN_28_DAYS';
  }
}
