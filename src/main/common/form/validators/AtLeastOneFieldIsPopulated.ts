import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class AtLeastOneFieldIsPopulatedConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (value === undefined) {
      return true;
    }

    return Object.keys(value).some(key => !!value[key]);
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
