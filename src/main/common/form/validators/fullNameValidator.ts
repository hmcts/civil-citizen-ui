import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value is a valid name length
 */
@ValidatorConstraint({name: 'FullNameValidator', async: false})
export class FullNameValidator implements ValidatorConstraintInterface {
  validate(input: string, validationArguments?: ValidationArguments) {
    const title = validationArguments.constraints[0];
    const name = validationArguments.constraints[1];
    return (name.length + input.length + title.length <= 68);
  }

  defaultMessage() {
    return 'ERRORS.FULL_NAME_TOO_LONG';
  }
}
