import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from '@hmcts/class-validator';
import { isCMCReference } from 'shared/utils/isCMCReference';
import { isCCBCCaseReference } from 'shared/utils/isCCBCCaseReference';

@ValidatorConstraint()
export class CheckClaimReferenceNumberConstraint implements ValidatorConstraintInterface {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any | string, args?: ValidationArguments): boolean {
    if (value === undefined || value === '') {
      return true;
    }

    return isCMCReference(value) || isCCBCCaseReference(value);
  }
}

/**
 * Verify claim reference is valid.
 */
export function IsClaimReferenceNumber(validationOptions?: ValidationOptions) {
  return function(object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: CheckClaimReferenceNumberConstraint,
    });
  };
}
