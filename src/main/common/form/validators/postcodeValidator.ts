import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';
import {DEFENDANT_POSTCODE_NOT_VALID} from '../validationErrors/errorMessageConstants';

/**
 * Validates that the input value is in correct post code format
 */
@ValidatorConstraint({name: 'customInt', async: false})
export class PostcodeValidator implements ValidatorConstraintInterface {

  readonly UK_POSTCODE_REGEX = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))[0-9][A-Za-z]{2}))$/; // NOSONAR

  validate(value: string) {
    const ukPostCodePattern = this.UK_POSTCODE_REGEX;
    const normalised = value.toString().replace(/\s/g, '');
    if (!value) {
      return true;
    }
    return ukPostCodePattern.test(normalised);
  }

  defaultMessage() {
    return DEFENDANT_POSTCODE_NOT_VALID;
  }
}

