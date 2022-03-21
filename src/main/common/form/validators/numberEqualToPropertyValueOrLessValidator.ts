import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {VALID_NUMBER_FOR_PREVIOUS_PAGE} from '../validationErrors/errorMessageConstants';
import {Form} from '../../form/models/form';

/**
 * Validates a number against a value of a object property. Returns true if the number is equal to or less than the property value number.
 * Will not validate (return true) if the property value is not numeric or is not defined
 */
@ValidatorConstraint({name: 'customAccountBalanceValidator'})
export class NumberEqualToPropertyValueOrLessValidator implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return VALID_NUMBER_FOR_PREVIOUS_PAGE;
  }

  /**
   * Requires property definition in validation arguments. So that the value is validated against the value of that property For example {property}
   * @param value
   * @param validationArguments {constraints:[string]} where string in the array would be a property name of the compared field
   * For example @Validate(NumberEqualToPropertyValueOrLessValidator, ['maxValue']
   */
  validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    if (validationArguments.constraints && validationArguments.constraints.length > 0) {
      const property = validationArguments.constraints[0];
      const propertyValue = (validationArguments.object as any | Form)[property];
      if (propertyValue === undefined || isNaN(propertyValue)) {
        return true;
      }
      return value <= propertyValue;
    }
    return true;
  }
}
