import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that phone number has correct UK format
 */
@ValidatorConstraint({name: 'ukPhone', async: false})
export class PhoneUKValidator implements ValidatorConstraintInterface {
  //eslint-disable-next-line
  readonly UK_PHONE_REGEX = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/; // NOSONAR

  validate(value: string) {
    const ukPhonePattern = this.UK_PHONE_REGEX;
    const normalised = value?.toString().replace(/\s/g, '');
    if (!value) {
      return true;
    }
    return ukPhonePattern.test(normalised);
  }

  defaultMessage() {
    return 'ERRORS.VALID_PHONE_NUMBER';
  }
}
