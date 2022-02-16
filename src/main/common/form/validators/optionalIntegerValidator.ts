import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value is either empty or an integer with no special characters
 */
@ValidatorConstraint({name: 'customInt', async: false})
export class OptionalIntegerValidator implements ValidatorConstraintInterface {

  validate(value: string) {
    const numberPattern = /^[0-9]+$/;
    if (value === '' || value === undefined) {
      return true;
    }
    return numberPattern.test(value);
  }

  defaultMessage() {
    return 'There was a problem. Please enter numeric number';
  }
}
