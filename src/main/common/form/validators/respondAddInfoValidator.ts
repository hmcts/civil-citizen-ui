import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates a number against a value of an object property. Returns true if the number is equal to or less than the property value number.
 * Will not validate (return true) if the property value is not numeric or is not defined
 */
@ValidatorConstraint({name: 'respondAddInfoValidator'})
export class RespondAddInfoValidator implements ValidatorConstraintInterface {
  hasText: boolean;

  defaultMessage(): string {
    return !this.hasText ? 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION' : 'ERRORS.GENERAL_APPLICATION.RESPONDENT_UPLOAD_OPTION.EMPTY_OPTION_TEXT';
  }

  /**
   * Requires property definition in validation arguments. So that the value is validated against the value of that property For example {property}
   * @param value
   * @param validationArguments {constraints:[string]} where string in the array would be a property name of the compared field
   * For example @Validate(NumberEqualToPropertyValueOrLessValidator, ['maxValue']
   */
  validate(value: string, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      const property = validationArguments.constraints[0];
      const additionalText = (validationArguments.object as any)[property];
      if (additionalText === null || additionalText === undefined || !additionalText) {
        this.hasText = false;
      } else {
        this.hasText = true;
      }
      if (value === undefined || !value) {
        return false;
      }
    }
    return true;
  }
}
