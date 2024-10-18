import {Validate, ValidateIf} from 'class-validator';
import {ValidationArgs} from './genericForm';
import {PhoneUKValidator} from 'form/validators/phoneUKValidator';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.VALID_PHONE_NUMBER';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<PhoneValidationWithMessage>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class PhoneValidationWithMessage {
  messageName?: string;

  @ValidateIf(o => o.alternativeTelephone)
  @Validate(PhoneUKValidator, {message: withMessage(generateErrorMessage)})
    alternativeTelephone?: string;

  constructor(alternativeTelephone?: string, messageName?: string) {
    this.alternativeTelephone = alternativeTelephone;
    this.messageName = messageName;
  }
}
