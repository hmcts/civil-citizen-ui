import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({ name: 'fileSize', async: false })
class FileSizeValidator implements ValidatorConstraintInterface {
  validate(size: number, args: ValidationArguments) {
    if (!size) {
      return true; // If file or size property is missing, assume validation passes (you can modify this behavior as needed)
    }

    const fileSizeLimit = 100 * 1024 * 1024; // 100MB in bytes
    return size <= fileSizeLimit;
  }

  defaultMessage() {
    return 'File size exceeds the allowed limit.';
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
