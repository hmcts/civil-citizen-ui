import {
  registerDecorator, ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {FileOnlySection} from 'models/caseProgression/uploadDocumentsUserForm';

@ValidatorConstraint({ name: 'fileSizeValidator', async: false })
export class FileSizeValidator implements ValidatorConstraintInterface {
  validate(size: any, args: ValidationArguments) {
    if(args?.object instanceof FileOnlySection && args.object.fileUpload){
      size = args.object.fileUpload.size;
    }
    if (!size) {
      return true;
    }

    const fileSizeLimit = 100 * 1024 * 1024; // 100MB in bytes
    return size <= fileSizeLimit;
  }

}

export function IsFileSize(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isFileSize',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FileSizeValidator,
    });
  };
}
