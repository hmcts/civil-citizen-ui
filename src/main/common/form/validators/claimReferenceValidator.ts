import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'customZeroOrMinOnePerson', async: false})
export class ClaimReferenceValidator implements ValidatorConstraintInterface {
  stringValue: string;

  validate(value: string) {
    this.stringValue = value;
    return !(!value || !(/^\d\d\d[A-Z][A-Z]\d\d\d$/i.test(value)));
  }

  defaultMessage() {
    return this.stringValue ? 'ERRORS.VALID_CLAIM_REFERENCE_NUMBER' : 'ERRORS.CLAIM_NUMBER_REQUIRED';
  }
}
