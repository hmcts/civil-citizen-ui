import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isAllowedMimeType', async: false })
export class IsAllowedMimeTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const allowedMimeTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint
      'application/pdf',
      'application/rtf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff',
    ];
    console.log('validator');
    if (value && allowedMimeTypes.includes(value)) {
      return true;
    }
    return false;
  }
}

export function IsAllowedMimeType(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'isAllowedMimeType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsAllowedMimeTypeConstraint,
    });
  };
}
