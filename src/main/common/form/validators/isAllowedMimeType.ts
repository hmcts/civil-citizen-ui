import {
  registerDecorator,
  ValidationArguments, ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {FileOnlySection} from 'models/caseProgression/uploadDocumentsUserForm';

@ValidatorConstraint({ name: 'isAllowedMimeType', async: false })
export class IsAllowedMimeTypeValidator implements ValidatorConstraintInterface {
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
    const fileOnlySection = args?.object as FileOnlySection;
    if (typeof fileOnlySection === 'object' && fileOnlySection.fileUpload) {
      value = fileOnlySection.fileUpload.mimetype;
    }
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

