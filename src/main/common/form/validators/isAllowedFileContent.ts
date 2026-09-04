import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {isFileContentAllowed} from 'common/utils/fileContentTypeUtils';

@ValidatorConstraint({name: 'isAllowedFileContent', async: false})
export class IsAllowedFileContentValidator implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const declaredMimeType = (args.object as {mimetype?: string})?.mimetype;
    return isFileContentAllowed(value as Buffer | ArrayBuffer | Uint8Array, declaredMimeType);
  }
}

export function IsAllowedFileContent(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsAllowedFileContentValidator,
    });
  };
}
