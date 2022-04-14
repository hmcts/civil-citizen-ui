import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class AtLeastOneRowIsPopulatedConstraint implements ValidatorConstraintInterface {

  validate(value: any | Array<Record<string, unknown>>, _args?: ValidationArguments): boolean {
    if (value === undefined) {
      return false;
    }

    if (!(value instanceof Array)) {
      return false;
    }

    return value.filter(item => !item.isEmpty()).length >= 1;
  }
}

/**
 * Verify there is at least one populated row in multi-row form.
 */
export function AtLeastOneRowIsPopulated(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AtLeastOneRowIsPopulatedConstraint,
    });
  };
}
