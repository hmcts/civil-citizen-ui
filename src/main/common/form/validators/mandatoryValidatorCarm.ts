import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';

/**
 * Validates that the input value is not empty
 */
@ValidatorConstraint({name: 'mandatoryValidatorCam', async: false})
export class IsNotEmpty implements ValidatorConstraintInterface {

  // Returns true if it passes validation of carm is not enabled
  validate(input: any, validationArguments?: ValidationArguments) {
    const property = validationArguments.constraints[0];
    const carmEnabled = (validationArguments.object as any)[property];
    if (carmEnabled) {
      return input !== null && input !== undefined;
    }
    return true;
  }

  defaultMessage() {
    return 'ERRORS.ENTER_TELEPHONE_NUMBER';
  }
}
