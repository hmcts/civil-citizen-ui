import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that phone number has correct UK format
 */
@ValidatorConstraint({name: 'ukPhone', async: false})
export class PhoneUKValidator implements ValidatorConstraintInterface {
  //eslint-disable-next-line
  readonly UK_PHONE_REGEX = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/; // NOSONAR

  validate(value: string) {
    const ukPhonePattern = this.UK_PHONE_REGEX;
    const normalised = value?.toString();
    if (!value) {
      return true;
    }
    return ukPhonePattern.test(normalised);
  }

  defaultMessage() {
    return 'ERRORS.VALID_PHONE_NUMBER';
  }
}
