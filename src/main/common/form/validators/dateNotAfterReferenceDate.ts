import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import {getNumberOfDaysBetweenTwoDays} from '../../utils/dateUtils';

/**
 * Validates that the input value is not a date after the reference date
 */
@ValidatorConstraint({name: 'dateNotAfterReferenceDateValidator', async: false})
export class DateNotAfterReferenceDate implements ValidatorConstraintInterface {

  validate(inputDate: Date, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const referenceDate = (validationArguments.object as any)[property];
    const daysBetweenTwoDates = getNumberOfDaysBetweenTwoDays(inputDate, referenceDate);

    return !(inputDate !== null && daysBetweenTwoDates < 0);
  }

  defaultMessage() {
    return 'ERRORS.ENTER_UNAVAILABILITY_FROM_DATE_BEFORE_TO_DATE';
  }
}
