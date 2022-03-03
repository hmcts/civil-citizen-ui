import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_PHONE_NUMBER} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is either empty or an integer with no special characters
 */
@ValidatorConstraint({name: 'customInt', async: false})
export class OptionalIntegerValidator implements ValidatorConstraintInterface {

  validate(value: string) {
    const numberPattern = /^\d+$/;
    if (value === '' || value === undefined) {
      return true;
    }
    return numberPattern.test(value);
  }

  defaultMessage() {
    return VALID_PHONE_NUMBER;
  }
}
