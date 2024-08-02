import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value does not contain special characters ˆ ` ´ ¨
 */
@ValidatorConstraint({name: 'specialCharValidator', async: false})
export class SpecialCharValidator implements ValidatorConstraintInterface {

  readonly SPECIAL_CHARS = /[ˆ`´¨]/;

  validate(text: string) {
    if (!text) {
      return true;
    }
    return !(this.SPECIAL_CHARS.test(text));
  }

  defaultMessage() {
    return 'ERRORS.SPECIAL_CHARACTERS';
  }
}

