import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from '@hmcts/class-validator';

import { MomentFactory } from 'shared/momentFactory';
import { LocalDate } from 'forms/models/localDate';

@ValidatorConstraint()
export class DatePastConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args?: ValidationArguments) {
    if (value === undefined) {
      return true;
    }

    if (!(value instanceof LocalDate)) {
      return false;
    }

    const date = value.toMoment();
    const now = MomentFactory.currentDate();
    return date.isBefore(now);
  }
}

export function IsPastDate(validationOptions?: ValidationOptions) {
  return function(object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: DatePastConstraint,
    });
  };
}
