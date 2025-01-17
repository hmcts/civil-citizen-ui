import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import validator from 'validator';

/**
 * Validate emails
 */
@ValidatorConstraint({name: 'emailValidator', async: false})
export class EmailValidator implements ValidatorConstraintInterface {
  //eslint-disable-next-line
  readonly EMAIL_REGEX = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;
  readonly EMAIL_MAX_LENGTH = 320;

  validate(value: string) {
    const emailPattern = this.EMAIL_REGEX;
    if (!value) {
      return true;
    }
    if (value?.length > this.EMAIL_MAX_LENGTH || !validator.isEmail(value)) {
      return false;
    }
    return emailPattern.test(value);
  }

  defaultMessage() {
    return 'ERRORS.ENTER_VALID_EMAIL';
  }
}
