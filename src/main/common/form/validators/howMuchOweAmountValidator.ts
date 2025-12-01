import {ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates a how much you owe amount against a total amount. Returns true if the amount submitted is equal to or less than the total amount minus one-pence.
 * Will not validate (return true) if the property value is not numeric or is not defined
 */
@ValidatorConstraint({name: 'howMuchOweAmountValidator'})
export class HowMuchOweAmountValidator implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return 'ERRORS.VALID_NUMBER_FOR_PREVIOUS_PAGE';
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
      const propertyValue = (validationArguments.object as any)[property];
      if (propertyValue === undefined || Number.isNaN(propertyValue) || !value || Number.isNaN(value)) {
        return true;
      }
      const ONE_PENCE = 0.01;
      return Number(value) <= (propertyValue - ONE_PENCE);
    }
    return true;
  }
}
