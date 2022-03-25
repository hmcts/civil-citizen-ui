import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class AtLeastOneFieldIsPopulatedConstraint implements ValidatorConstraintInterface {
  validate(value: Record<string, unknown>): boolean {
    if (value === undefined) {
      return false;
    }

    return Object.keys(value).some((key: string) => !!value[key]);
  }
}

/**
 * Verifies if at least one of the fields in given object is populated with "truthy" value.
 */
export function AtLeastOneFieldIsPopulated(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AtLeastOneFieldIsPopulatedConstraint,
    });
  };
}
