import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAllowedMimeType', async: false })
export class IsAllowedMimeTypeValidator implements ValidatorConstraintInterface {
  validate(value: any) {
    const allowedMimeTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word docx
      'application/msword', // Word doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel xlsx
      'application/vnd.ms-excel', // Excel xls
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint pptx
      'application/vnd.ms-powerpoint', // PowerPoint ppt
      'application/pdf',
      'application/rtf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff',
    ];
    if (value && allowedMimeTypes.includes(value)) {
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

