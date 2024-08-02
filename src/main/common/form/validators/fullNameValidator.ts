import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the combined inputs length for the name (title, firstName and lastName) is <= 70
 */
@ValidatorConstraint({name: 'fullNameValidator', async: false})
export class FullNameValidator implements ValidatorConstraintInterface {
  errorMessage: string;

  validate(fieldText: string, validationArguments?: ValidationArguments) {
    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      const property = validationArguments.constraints[0];
      this.errorMessage = validationArguments.constraints[1];
      const value = (validationArguments.object as never)[property];
      return value <= 70;
    }
    return true;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
