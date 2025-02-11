import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';

/**
 * Validates that the input value is not empty
 */
@ValidatorConstraint({name: 'mandatoryValidatorForParty', async: false})
export class IsNotEmptyForParty implements ValidatorConstraintInterface {

  // Returns true if it passes validation or if mandatoryForParty is not enabled
  validate(input: any, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const mandatoryForParty = (validationArguments.object as any)[property];
    if (mandatoryForParty) {
      return input !== null && input !== undefined && input !== '';
    }
    return true;
  }

  defaultMessage() {
    return 'ERRORS.ENTER_TELEPHONE_NUMBER';
  }
}
