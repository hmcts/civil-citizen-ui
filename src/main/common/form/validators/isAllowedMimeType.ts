import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const ALLOWED_MIME_TYPES: string[] = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/pdf',
  'application/rtf',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/bmp',
  'image/tiff',
  'text/rtf',
];

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

