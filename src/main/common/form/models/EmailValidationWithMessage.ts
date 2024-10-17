import {Validate, ValidateIf} from 'class-validator';
import {ValidationArgs} from './genericForm';
import {EmailValidator} from 'form/validators/emailValidator';

const generateErrorMessage = (messageName: string): string => {
  return messageName || 'ERRORS.ENTER_VALID_EMAIL';
};

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<EmailValidationWithMessage>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

export class EmailValidationWithMessage {
  messageName?: string;

  @ValidateIf(o => o.emailAddress)
  @Validate(EmailValidator, {message: withMessage(generateErrorMessage)})
    emailAddress?: string;

  constructor(emailAddress?: string, messageName?: string) {
    this.emailAddress = emailAddress;
    this.messageName = messageName;
  }
}
