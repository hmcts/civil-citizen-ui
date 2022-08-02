import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class AtLeastOnePopulatedRowConstraint implements ValidatorConstraintInterface {

  validate (value: Array<any>): boolean {
    return value.filter(item => !item.isEmpty()).length >= 1;
  }
}

/**
 * Verify there is at least one populated row.
 */
export function AtLeastOnePopulatedRow (validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AtLeastOnePopulatedRowConstraint,
    });
  };
}
