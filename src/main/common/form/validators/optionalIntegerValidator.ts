import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';

/**
 * Validates that the input value is either empty or an integer with no special characters
 */
@ValidatorConstraint({name: 'customInt', async: false})
export class OptionalIntegerValidator implements ValidatorConstraintInterface {

  validate(value: string, args: ValidationArguments) {
    const numberPattern = new RegExp('^[0-9]+$');
    if (value === '' || value === undefined) {
      return true;
    }
    return numberPattern.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'There was a problem. Please enter numeric number';
  }

}
