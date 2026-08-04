import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the combined inputs length for the name (title, firstName and lastName) is <= 70
 */
@ValidatorConstraint({name: 'fullNameValidator', async: true})
export class FullNameValidator implements ValidatorConstraintInterface {
  errorMessage: string[] = [];

  async validate(text: string, validationArguments?: ValidationArguments) {
    if (text) {
      if (validationArguments.property == 'title' && text.trim().length > 35) { // Always validate this
        this.errorMessage.push('ERRORS.ENTER_VALID_TITLE');
        return false;
      }

      if (validationArguments.constraints && text.length > 0) {
        const property = validationArguments.constraints[0];
        const value = (validationArguments.object as never)[property];
        if (value > 70) {
          this.errorMessage.push(validationArguments.constraints[1]);
          return false;
        }
      }
    }
    return true;
  }

  defaultMessage() {
    return this.errorMessage.pop();
  }
}
