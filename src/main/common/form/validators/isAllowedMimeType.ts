import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {ALLOWED_MIME_TYPES} from 'common/utils/fileUploadUtils';

@ValidatorConstraint({ name: 'isAllowedMimeType', async: false })
export class IsAllowedMimeTypeValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    if (value && ALLOWED_MIME_TYPES.includes(value)) {
      return true;
    }
    return false;
  }
}

export function IsAllowedMimeType(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsAllowedMimeTypeValidator,
    });
  };
}

