import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB in bytes

@ValidatorConstraint({ name: 'fileSizeValidator', async: false })
export class FileSizeValidator implements ValidatorConstraintInterface {
  validate(size: number) {
    if (!size) {
      return true;
    }

    return size <= FILE_SIZE_LIMIT;
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
