import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'fullNameValidator', async: false})
export class FullNameValidator implements ValidatorConstraintInterface {
  characterCount: number;

  validate(value: number) {
    this.characterCount = value;
    return value <= 70;
  }

  defaultMessage() {
    return 'ERRORS.TEXT_TOO_MANY';
  }
}
