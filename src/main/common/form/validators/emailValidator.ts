import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validate emails
 */
@ValidatorConstraint({name: 'emailValidator', async: false})
export class EmailValidator implements ValidatorConstraintInterface {
  //eslint-disable-next-line
  readonly EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  
  validate(value: string) {
    const emailPattern = this.EMAIL_REGEX;
    if (!value) {
      return true;
    }
    return emailPattern.test(value);
  }

  defaultMessage() {
    return 'ERRORS.ENTER_VALID_EMAIL';
  }
}
